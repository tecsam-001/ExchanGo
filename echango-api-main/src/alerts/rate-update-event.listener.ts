import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RateUpdateEvent } from '../events/rate-update.event';
import { AlertsService } from './alerts.service';
import { OfficesService } from '../offices/offices.service';
import { UltraMsgService } from '../ultramsg/ultramsg.service';
import { TriggerType } from './infrastructure/persistence/relational/entities/alert.entity';

@Injectable()
export class RateUpdateListener {
  private readonly logger = new Logger(RateUpdateListener.name);

  constructor(
    private readonly alertService: AlertsService,
    private readonly officesService: OfficesService,
    private readonly ultraMsgService: UltraMsgService,
  ) {}

  @OnEvent('rate.update', { async: true })
  async handleRateUpdate(event: RateUpdateEvent) {
    try {
      const { office, targetCurrency, baseCurrency, newBuyRate, newSellRate } =
        event;

      this.logger.log(
        `Processing rate update for office ${office.id}, ${baseCurrency.code} -> ${targetCurrency.code}`,
      );

      const officeEntity = await this.officesService.findById(office.id);

      if (!officeEntity || !officeEntity.city) {
        this.logger.error(`Invalid office data for office ID: ${office.id}`);
        return;
      }

      // Determine rate direction based on currency
      const direction = baseCurrency.code === 'MAD' ? 'BUY' : 'SELL';
      const targetRate = direction === 'BUY' ? newBuyRate : newSellRate;

      // Check for CITY-based alerts
      await this.processCityAlerts(
        officeEntity.city.id,
        baseCurrency.id,
        targetCurrency.id,
        targetRate,
      );

      // Check for OFFICE-based alerts
      await this.processOfficeAlerts(
        office,
        baseCurrency.id,
        targetCurrency.id,
        targetRate,
      );
    } catch (error) {
      this.logger.error('Error processing rate update event:', error);
    }
  }

  private async processCityAlerts(
    cityId: string,
    baseCurrencyId: string,
    targetCurrencyId: string,
    targetRate: number,
  ) {
    try {
      const cityAlerts = await this.alertService.getMatchingAlertsAdvanced({
        triggerType: TriggerType.CITY,
        city: cityId,
        baseCurrencyId,
        targetCurrencyId,
        targetCurrencyRate: targetRate,
      });

      this.logger.log(`Found ${cityAlerts.length} matching city alerts`);

      for (const alert of cityAlerts) {
        await this.sendWhatsAppNotification(alert, 'city', targetRate);
      }
    } catch (error) {
      this.logger.error('Error processing city alerts:', error);
    }
  }

  private async processOfficeAlerts(
    office: any,
    baseCurrencyId: string,
    targetCurrencyId: string,
    targetRate: number,
  ) {
    try {
      const officeAlerts = await this.alertService.getMatchingAlertsAdvanced({
        triggerType: TriggerType.OFFICE,
        office: office.id,
        baseCurrencyId,
        targetCurrencyId,
        targetCurrencyRate: targetRate,
      });

      this.logger.log(`Found ${officeAlerts.length} matching office alerts`);

      for (const alert of officeAlerts) {
        this.logger.debug(
          `Alert ${alert.id} has ${alert.offices?.length || 0} offices loaded`,
        );
        if (alert.offices && alert.offices.length > 0) {
          this.logger.debug(
            `Office names: ${alert.offices.map((o: any) => o.officeName).join(', ')}`,
          );
        }
        this.logger.debug(
          `Context office from event: ${JSON.stringify(office)}`,
        );
        // Add the office information from the event to the alert context
        await this.sendWhatsAppNotification(
          alert,
          'office',
          targetRate,
          office,
        );
      }
    } catch (error) {
      this.logger.error('Error processing office alerts:', error);
    }
  }

  private async sendWhatsAppNotification(
    alert: any,
    triggerType: 'city' | 'office',
    currentRate: number,
    contextOffice?: any,
  ) {
    try {
      const message = this.buildNotificationMessage(
        alert,
        triggerType,
        currentRate,
        contextOffice,
      );
      const formattedNumber = this.ultraMsgService.formatPhoneNumber(
        alert.whatsAppNumber,
      );

      await this.ultraMsgService.sendMessage(formattedNumber, message);

      this.logger.log(
        `WhatsApp notification sent to ${alert.whatsAppNumber} for alert ${alert.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp notification to ${alert.whatsAppNumber}:`,
        error,
      );
    }
  }

  private buildNotificationMessage(
    alert: any,
    triggerType: 'city' | 'office',
    currentRate: number,
    contextOffice?: any,
  ): string {
    const sourceCurrency = alert.currency.code;
    const targetCurrency = alert.targetCurrency.code;

    if (triggerType === 'office') {
      return this.buildOfficeNotificationMessage(
        alert,
        currentRate,
        sourceCurrency,
        targetCurrency,
        contextOffice,
      );
    } else if (triggerType === 'city' && alert.cities?.length > 0) {
      return this.buildCityNotificationMessage(
        alert,
        currentRate,
        sourceCurrency,
        targetCurrency,
      );
    }

    // Fallback message
    return this.buildGenericNotificationMessage(
      alert,
      currentRate,
      sourceCurrency,
      targetCurrency,
    );
  }

  private buildOfficeNotificationMessage(
    alert: any,
    currentRate: number,
    sourceCurrency: string,
    targetCurrency: string,
    contextOffice?: any,
  ): string {
    // Use context office if available, otherwise fall back to alert offices
    const offices = alert.offices;
    let officeName = '';

    this.logger.debug(
      `Building office notification - contextOffice: ${contextOffice?.officeName}, alert.offices: ${offices?.length}`,
    );

    if (contextOffice && contextOffice.officeName) {
      // We have the specific office from the rate update event
      officeName = contextOffice.officeName;
      this.logger.debug(`Using context office: ${officeName}`);
      return `🔔 Alerte ExchanGo24 : Votre taux cible est disponible !

Le taux que vous attendiez est maintenant proposé par un bureau de change dans votre zone sélectionnée :

💱 1 ${sourceCurrency} = ${currentRate} ${targetCurrency}
📍 Bureau : ${officeName}

⚠️ Ce taux peut rapidement évoluer, ne tardez pas à en profiter !

👉 [Voir le bureau maintenant]

ExchanGo24, trouvez le meilleur taux facilement.`;
    }

    // Fallback to alert offices if available
    if (offices && offices.length > 0) {
      if (offices.length === 1) {
        // Cas 1 : Un seul bureau de change atteint le taux cible
        officeName = offices[0].officeName;

        return `🔔 Alerte ExchanGo24 : Votre taux cible est disponible !

Le taux que vous attendiez est maintenant proposé par un bureau de change dans votre zone sélectionnée :

💱 1 ${sourceCurrency} = ${currentRate} ${targetCurrency}
📍 Bureau : ${officeName}

⚠️ Ce taux peut rapidement évoluer, ne tardez pas à en profiter !

👉 [Voir le bureau maintenant]

ExchanGo24, trouvez le meilleur taux facilement.`;
      } else {
        // Cas 2 : Plusieurs bureaux de change atteignent le taux cible
        return `🔔 Alerte ExchanGo24 : Plusieurs bureaux atteignent votre taux cible !

Bonne nouvelle ! Plusieurs bureaux de change proposent actuellement votre taux recherché dans votre zone :

💱 1 ${sourceCurrency} = ${currentRate} ${targetCurrency}
📍 Nombre de bureaux : ${offices.length}

⚠️ Ces taux peuvent changer rapidement, profitez-en vite !

👉 [Comparer les bureaux]

ExchanGo24, trouvez toujours le meilleur taux en un clic.`;
      }
    }

    // Final fallback if no office information is available
    return this.buildGenericNotificationMessage(
      alert,
      currentRate,
      sourceCurrency,
      targetCurrency,
    );
  }

  private buildCityNotificationMessage(
    alert: any,
    currentRate: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): string {
    const cities = alert.cities;
    const cityNames = cities.map((city: any) => city.name).join(', ');

    return `🔔 Alerte ExchanGo24 : Votre taux cible est disponible !

Le taux que vous attendiez est maintenant proposé par un bureau de change dans votre zone sélectionnée :

💱 1 ${sourceCurrency} = ${currentRate} ${targetCurrency}
📍 Zone : ${cityNames}

⚠️ Ce taux peut rapidement évoluer, ne tardez pas à en profiter !

👉 [Voir les bureaux disponibles]

ExchanGo24, trouvez le meilleur taux facilement.`;
  }

  private buildGenericNotificationMessage(
    alert: any,
    currentRate: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): string {
    return `🔔 Alerte ExchanGo24 : Votre taux cible est disponible !

Le taux que vous attendiez est maintenant disponible :

💱 1 ${sourceCurrency} = ${currentRate} ${targetCurrency}

⚠️ Ce taux peut rapidement évoluer, ne tardez pas à en profiter !

ExchanGo24, trouvez le meilleur taux facilement.`;
  }
}
