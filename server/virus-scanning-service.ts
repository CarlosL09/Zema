import { VirusScanResult, InsertVirusScanResult, SecurityAlert, InsertSecurityAlert } from '../shared/schema.js';

interface VirusScanRequest {
  filename: string;
  fileSize: number;
  mimeType: string;
  fileContent: Buffer | string; // Base64 or binary data
  emailId?: string;
  attachmentId?: string;
}

interface ScanResult {
  isClean: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical' | null;
  virusNames: string[];
  scanProvider: string;
  scanDuration: number;
  engines?: any[];
}

interface VirusScanProvider {
  name: string;
  scanFile(request: VirusScanRequest): Promise<ScanResult>;
  isAvailable(): boolean;
}

/**
 * Cloudmersive Virus Scan API Provider
 */
class CloudmersiveProvider implements VirusScanProvider {
  name = 'cloudmersive';
  private apiKey: string;
  private baseUrl = 'https://api.cloudmersive.com/virus/scan';

  constructor() {
    this.apiKey = process.env.CLOUDMERSIVE_API_KEY || '';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async scanFile(request: VirusScanRequest): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      const formData = new FormData();
      
      // Convert file content to blob
      const blob = new Blob([request.fileContent], { type: request.mimeType });
      formData.append('inputFile', blob, request.filename);

      const response = await fetch(`${this.baseUrl}/file`, {
        method: 'POST',
        headers: {
          'Apikey': this.apiKey,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Cloudmersive API error: ${response.status}`);
      }

      const result = await response.json();
      const scanDuration = Date.now() - startTime;

      return {
        isClean: result.CleanResult === true,
        threatLevel: result.FoundViruses?.length > 0 ? 'high' : null,
        virusNames: result.FoundViruses || [],
        scanProvider: this.name,
        scanDuration,
        engines: [{ name: 'Cloudmersive', result: result.CleanResult }]
      };

    } catch (error) {
      console.error('Cloudmersive scan error:', error);
      throw error;
    }
  }
}

/**
 * AttachmentScanner API Provider
 */
class AttachmentScannerProvider implements VirusScanProvider {
  name = 'attachmentscanner';
  private baseUrl = 'https://api.attachmentscanner.com/v1';

  isAvailable(): boolean {
    return true; // Free tier available
  }

  async scanFile(request: VirusScanRequest): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      // For AttachmentScanner, we can scan by URL or upload directly
      const formData = new FormData();
      const blob = new Blob([request.fileContent], { type: request.mimeType });
      formData.append('file', blob, request.filename);

      const response = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`AttachmentScanner API error: ${response.status}`);
      }

      const result = await response.json();
      const scanDuration = Date.now() - startTime;

      return {
        isClean: result.scan_result === 'clean',
        threatLevel: result.threat_level || null,
        virusNames: result.threats || [],
        scanProvider: this.name,
        scanDuration,
        engines: result.engines || []
      };

    } catch (error) {
      console.error('AttachmentScanner scan error:', error);
      throw error;
    }
  }
}

/**
 * OPSWAT MetaDefender Provider (Multi-engine scanning)
 */
class OpswatProvider implements VirusScanProvider {
  name = 'opswat';
  private apiKey: string;
  private baseUrl = 'https://api.metadefender.com/v4';

  constructor() {
    this.apiKey = process.env.OPSWAT_API_KEY || '';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async scanFile(request: VirusScanRequest): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Upload file for scanning
      const uploadResponse = await fetch(`${this.baseUrl}/file`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/octet-stream',
          'filename': request.filename
        },
        body: request.fileContent
      });

      if (!uploadResponse.ok) {
        throw new Error(`OPSWAT upload error: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      const dataId = uploadResult.data_id;

      // Step 2: Poll for scan results
      let scanResult;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const resultResponse = await fetch(`${this.baseUrl}/file/${dataId}`, {
          method: 'GET',
          headers: {
            'apikey': this.apiKey
          }
        });

        if (!resultResponse.ok) {
          throw new Error(`OPSWAT result error: ${resultResponse.status}`);
        }

        scanResult = await resultResponse.json();
        attempts++;

      } while (scanResult.scan_results?.progress_percentage < 100 && attempts < maxAttempts);

      const scanDuration = Date.now() - startTime;
      const engines = scanResult.scan_results?.scan_details || {};
      const threats = Object.values(engines)
        .filter((engine: any) => engine.threat_found)
        .map((engine: any) => engine.def_name);

      return {
        isClean: threats.length === 0,
        threatLevel: threats.length > 0 ? 'high' : null,
        virusNames: threats,
        scanProvider: this.name,
        scanDuration,
        engines: Object.entries(engines).map(([name, details]: [string, any]) => ({
          name,
          result: details.scan_result_i === 0 ? 'clean' : 'infected',
          threat: details.def_name
        }))
      };

    } catch (error) {
      console.error('OPSWAT scan error:', error);
      throw error;
    }
  }
}

/**
 * Main Virus Scanning Service
 */
export class VirusScanningService {
  private providers: VirusScanProvider[];
  private storage: any; // Will be injected

  constructor(storage: any) {
    this.storage = storage;
    this.providers = [
      new CloudmersiveProvider(),
      new AttachmentScannerProvider(),
      new OpswatProvider()
    ];
  }

  /**
   * Scan a file using available providers
   */
  async scanFile(userId: string, request: VirusScanRequest): Promise<VirusScanResult> {
    // Get first available provider
    const provider = this.providers.find(p => p.isAvailable());
    
    if (!provider) {
      throw new Error('No virus scanning providers available. Please configure API keys.');
    }

    // Create initial scan record
    const scanRecord: InsertVirusScanResult = {
      userId,
      emailId: request.emailId || null,
      attachmentId: request.attachmentId || null,
      filename: request.filename,
      fileSize: request.fileSize,
      mimeType: request.mimeType,
      scanProvider: provider.name,
      scanStatus: 'scanning',
      scanStartedAt: new Date(),
      quarantined: false,
      userNotified: false,
      adminNotified: false
    };

    const scanId = await this.storage.createVirusScanResult(scanRecord);

    try {
      // Perform the scan
      const result = await provider.scanFile(request);

      // Update scan record with results
      const updatedRecord: Partial<InsertVirusScanResult> = {
        scanStatus: result.isClean ? 'clean' : 'infected',
        threatLevel: result.threatLevel,
        virusNames: result.virusNames,
        scanEngines: result.engines,
        scanCompletedAt: new Date(),
        scanDuration: result.scanDuration,
        actionTaken: result.isClean ? 'allow' : 'quarantine',
        quarantined: !result.isClean
      };

      await this.storage.updateVirusScanResult(scanId, updatedRecord);

      // Create security alert if threat detected
      if (!result.isClean) {
        await this.createSecurityAlert(userId, scanId, result, request);
      }

      return await this.storage.getVirusScanResult(scanId);

    } catch (error) {
      // Update scan record with error
      await this.storage.updateVirusScanResult(scanId, {
        scanStatus: 'error',
        scanCompletedAt: new Date(),
        actionTaken: 'block' // Block on error for safety
      });

      throw error;
    }
  }

  /**
   * Scan email attachments automatically
   */
  async scanEmailAttachments(userId: string, emailId: string, attachments: any[]): Promise<VirusScanResult[]> {
    const results: VirusScanResult[] = [];

    for (const attachment of attachments) {
      try {
        const scanRequest: VirusScanRequest = {
          filename: attachment.filename,
          fileSize: attachment.size,
          mimeType: attachment.mimeType,
          fileContent: attachment.content, // Base64 or Buffer
          emailId,
          attachmentId: attachment.id
        };

        const result = await this.scanFile(userId, scanRequest);
        results.push(result);

      } catch (error) {
        console.error(`Error scanning attachment ${attachment.filename}:`, error);
        // Continue with other attachments
      }
    }

    return results;
  }

  /**
   * Get scan history for user
   */
  async getScanHistory(userId: string, limit = 50): Promise<VirusScanResult[]> {
    return await this.storage.getVirusScanResultsByUser(userId, limit);
  }

  /**
   * Get scan results for specific email
   */
  async getEmailScanResults(emailId: string): Promise<VirusScanResult[]> {
    return await this.storage.getVirusScanResultsByEmail(emailId);
  }

  /**
   * Create security alert for detected threats
   */
  private async createSecurityAlert(
    userId: string, 
    scanId: number, 
    scanResult: ScanResult, 
    request: VirusScanRequest
  ): Promise<void> {
    const alertData: InsertSecurityAlert = {
      userId,
      alertType: 'virus_detected',
      severity: scanResult.threatLevel || 'medium',
      title: `Virus Detected: ${request.filename}`,
      description: `Threat(s) found in attachment: ${scanResult.virusNames.join(', ')}`,
      metadata: {
        filename: request.filename,
        fileSize: request.fileSize,
        mimeType: request.mimeType,
        virusNames: scanResult.virusNames,
        scanProvider: scanResult.scanProvider
      },
      emailId: request.emailId || null,
      virusScanId: scanId,
      status: 'active'
    };

    await this.storage.createSecurityAlert(alertData);
  }

  /**
   * Get available scanning providers
   */
  getAvailableProviders(): string[] {
    return this.providers
      .filter(p => p.isAvailable())
      .map(p => p.name);
  }

  /**
   * Get security alerts for user
   */
  async getSecurityAlerts(userId: string, status?: string): Promise<SecurityAlert[]> {
    return await this.storage.getSecurityAlertsByUser(userId, status);
  }

  /**
   * Acknowledge security alert
   */
  async acknowledgeAlert(alertId: number, userId: string): Promise<void> {
    await this.storage.updateSecurityAlert(alertId, {
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date()
    });
  }
}

export { VirusScanRequest, ScanResult };