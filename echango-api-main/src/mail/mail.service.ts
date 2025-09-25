import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

import { MaybeType } from '../utils/types/maybe.type';
import { MailerService } from '../mailer/mailer.service';
import path from 'path';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-email.text1'),
        i18n.t('confirm-email.text2'),
        i18n.t('confirm-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('reset-password.text1'),
        i18n.t('reset-password.text2'),
        i18n.t('reset-password.text3'),
        i18n.t('reset-password.text4'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/password-change',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1,
        text2,
        text3,
        text4,
      },
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-new-email.text1'),
        i18n.t('confirm-new-email.text2'),
        i18n.t('confirm-new-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async emailChanged(mailData: MailData<object>): Promise<void> {
    const i18n = I18nContext.current();
    let emailChangedTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let actionTitle: MaybeType<string>;

    if (i18n) {
      [emailChangedTitle, text1, text2, text3, actionTitle] = await Promise.all(
        [
          i18n.t('common.emailChanged'),
          i18n.t('email-changed.text1'),
          i18n.t('email-changed.text2'),
          i18n.t('email-changed.text3'),
          i18n.t('email-changed.actionTitle'),
        ],
      );
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/login',
    );

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailChangedTitle,
      text: `${emailChangedTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'email-changed.hbs',
      ),
      context: {
        title: emailChangedTitle,
        url: url.toString(),
        actionTitle: actionTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async passwordChanged(mailData: MailData<object>): Promise<void> {
    const i18n = I18nContext.current();
    let passwordChangedTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let actionTitle: MaybeType<string>;

    if (i18n) {
      [passwordChangedTitle, text1, text2, text3, actionTitle] =
        await Promise.all([
          i18n.t('common.passwordChanged'),
          i18n.t('password-changed.text1'),
          i18n.t('password-changed.text2'),
          i18n.t('password-changed.text3'),
          i18n.t('password-changed.actionTitle'),
        ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/login',
    );

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: passwordChangedTitle,
      text: `${passwordChangedTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'password-changed.hbs',
      ),
      context: {
        title: passwordChangedTitle,
        url: url.toString(),
        actionTitle: actionTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async officeRegistrationReceived(mailData: MailData<object>): Promise<void> {
    const i18n = I18nContext.current();
    let officeRegistrationReceivedTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;
    let text5: MaybeType<string>;

    if (i18n) {
      [officeRegistrationReceivedTitle, text1, text2, text3, text4, text5] =
        await Promise.all([
          i18n.t('common.officeRegistrationReceived'),
          i18n.t('office-registration-received.text1'),
          i18n.t('office-registration-received.text2'),
          i18n.t('office-registration-received.text3'),
          i18n.t('office-registration-received.text4'),
          i18n.t('office-registration-received.text5'),
        ]);
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: officeRegistrationReceivedTitle,
      text: `${officeRegistrationReceivedTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'office-registration-received.hbs',
      ),
      context: {
        title: officeRegistrationReceivedTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
        text4,
        text5,
      },
    });
  }

  async officeApproved(mailData: MailData<object>): Promise<void> {
    const i18n = I18nContext.current();
    let officeApprovedTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let actionTitle: MaybeType<string>;

    if (i18n) {
      [officeApprovedTitle, text1, text2, text3, actionTitle] =
        await Promise.all([
          i18n.t('common.officeApproved'),
          i18n.t('office-approved.text1'),
          i18n.t('office-approved.text2'),
          i18n.t('office-approved.text3'),
          i18n.t('office-approved.actionTitle'),
        ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/login',
    );

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: officeApprovedTitle,
      text: `${officeApprovedTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'office-approved.hbs',
      ),
      context: {
        title: officeApprovedTitle,
        url: url.toString(),
        actionTitle: actionTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async officeRejected(
    mailData: MailData<{ rejectReason: string }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let officeRejectedTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [officeRejectedTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.officeRejected'),
        i18n.t('office-rejected.text1'),
        i18n.t('office-rejected.text2'),
        i18n.t('office-rejected.text3'),
        i18n.t('office-rejected.text4'),
      ]);
    }

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: officeRejectedTitle,
      text: `${officeRejectedTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'office-rejected.hbs',
      ),
      context: {
        title: officeRejectedTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3: `${text3} ${mailData.data.rejectReason}`,
        text4,
      },
    });
  }

  async rateUpdateReminder(
    mailData: MailData<{ officeName: string; ownerName: string }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let rateUpdateReminderTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [rateUpdateReminderTitle, text1, text2, text3, text4] = await Promise.all(
        [
          i18n.t('common.rateUpdateReminder'),
          i18n.t('rate-update-reminder.text1'),
          i18n.t('rate-update-reminder.text2'),
          i18n.t('rate-update-reminder.text3'),
          i18n.t('rate-update-reminder.text4'),
        ],
      );
    }

    const dashboardUrl = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/dashboard/rates',
    );

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: rateUpdateReminderTitle,
      text: `${rateUpdateReminderTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'rate-update-reminder.hbs',
      ),
      context: {
        title: rateUpdateReminderTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        officeName: mailData.data.officeName,
        ownerName: mailData.data.ownerName,
        dashboardUrl: dashboardUrl.toString(),
        text1,
        text2,
        text3,
        text4,
      },
    });
  }
}
