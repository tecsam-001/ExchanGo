import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ultramsg from 'ultramsg-whatsapp-api';

export interface MessageOptions {
  priority?: number;
  referenceId?: string;
}

export interface ImageMessageOptions extends MessageOptions {
  nocache?: boolean;
}

export interface LocationData {
  address: string;
  lat: string;
  lng: string;
}

export interface MessagesFilter {
  page?: number;
  limit?: number;
  status?: 'sent' | 'queue' | 'unsent' | 'invalid' | 'all';
  sort?: 'asc' | 'desc';
  id?: string;
  referenceId?: string;
  from?: string;
  to?: string;
  ack?: 'pending' | 'server' | 'device' | 'read' | 'played';
}

export interface WebhookSettings {
  sendDelay?: number;
  webhook_url?: string;
  webhook_message_received?: boolean;
  webhook_message_create?: boolean;
  webhook_message_ack?: boolean;
  webhook_message_download_media?: boolean;
}

@Injectable()
export class UltraMsgService {
  private readonly logger = new Logger(UltraMsgService.name);
  private api: any;

  constructor(private configService: ConfigService) {
    const instanceId = this.configService.get<string>('ULTRAMSG_INSTANCE_ID', {
      infer: true,
    });
    const token = this.configService.get<string>('ULTRAMSG_TOKEN', {
      infer: true,
    });

    if (!instanceId || !token) {
      throw new Error(
        'UltraMsg credentials not found in environment variables',
      );
    }

    this.api = new ultramsg(instanceId, token);
    this.logger.log('UltraMsg service initialized');
  }

  /**
   * Send a text message
   */
  async sendMessage(
    to: string,
    body: string,
    options: MessageOptions = {},
  ): Promise<any> {
    try {
      const { priority = 10, referenceId } = options;
      const response = await this.api.sendChatMessage(
        to,
        body,
        priority,
        referenceId,
      );
      this.logger.log(`Message sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send an image message
   */
  async sendImage(
    to: string,
    caption: string,
    image: string,
    options: ImageMessageOptions = {},
  ): Promise<any> {
    try {
      const { priority = 10, referenceId, nocache = false } = options;
      const response = await this.api.sendImageMessage(
        to,
        caption,
        image,
        priority,
        referenceId,
        nocache,
      );
      this.logger.log(`Image sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send image to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send a document
   */
  async sendDocument(
    to: string,
    filename: string,
    document: string,
  ): Promise<any> {
    try {
      const response = await this.api.sendDocumentMessage(
        to,
        filename,
        document,
      );
      this.logger.log(`Document sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send document to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send a link message
   */
  async sendLink(to: string, link: string): Promise<any> {
    try {
      const response = await this.api.sendLinkMessage(to, link);
      this.logger.log(`Link sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send link to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send a location
   */
  async sendLocation(to: string, locationData: LocationData): Promise<any> {
    try {
      const { address, lat, lng } = locationData;
      const response = await this.api.sendLocationMessage(
        to,
        address,
        lat,
        lng,
      );
      this.logger.log(`Location sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send location to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Resend messages by status
   */
  async resendByStatus(status: 'unsent' | 'expired'): Promise<any> {
    try {
      const response = await this.api.resendByStatus(status);
      this.logger.log(`Messages with status ${status} resent`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to resend messages by status ${status}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Resend message by ID
   */
  async resendById(id: string): Promise<any> {
    try {
      const response = await this.api.resendById(id);
      this.logger.log(`Message ${id} resent`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to resend message ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if number is WhatsApp user
   */
  async checkContact(chatId: string): Promise<any> {
    try {
      const response = await this.api.checkContact(chatId);
      return response;
    } catch (error) {
      this.logger.error(`Failed to check contact ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to format phone number to WhatsApp format
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Add @c.us suffix if not present
    if (!cleaned.includes('@')) {
      return `${cleaned}@c.us`;
    }

    return cleaned;
  }
}
