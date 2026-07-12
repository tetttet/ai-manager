import {
  KeyRound,
  Link2,
  ShieldCheck,
  Webhook,
  type LucideIcon,
} from "lucide-react";

import type {
  CanvasChannelApiSettings,
  CanvasChannelId,
} from "@/lib/agent-connections";

type ChannelSettingsFieldConfig = {
  key: string;
  label: string;
  defaultValue: string;
  icon: LucideIcon;
  secret?: boolean;
};

type ChannelSettingsEventConfig = {
  key: string;
  label: string;
  defaultEnabled: boolean;
};

export type ChannelSettingsConfig = {
  status: string;
  description: string;
  fields: ChannelSettingsFieldConfig[];
  events: ChannelSettingsEventConfig[];
};

export const channelSettingsConfig: Record<
  CanvasChannelId,
  ChannelSettingsConfig
> = {
  whatsapp: {
    status: "Test Version",
    description: "Test Version",
    fields: [
      {
        key: "provider",
        label: "Provider",
        defaultValue: "Meta WhatsApp Cloud API",
        icon: ShieldCheck,
      },
      {
        key: "phoneNumberId",
        label: "Phone Number ID",
        defaultValue: "123456789012345",
        icon: Link2,
      },
      {
        key: "businessAccountId",
        label: "Business Account ID",
        defaultValue: "987654321098765",
        icon: Link2,
      },
      {
        key: "accessToken",
        label: "Access Token",
        defaultValue: "EAABsbCS1iHgBO_static_preview_token",
        icon: KeyRound,
        secret: true,
      },
      {
        key: "webhookVerifyToken",
        label: "Webhook Verify Token",
        defaultValue: "ai_manager_whatsapp_verify",
        icon: Webhook,
        secret: true,
      },
      {
        key: "apiVersion",
        label: "API Version",
        defaultValue: "v22.0",
        icon: ShieldCheck,
      },
    ],
    events: [
      {
        key: "inboundMessages",
        label: "Inbound messages",
        defaultEnabled: true,
      },
      {
        key: "deliveryReceipts",
        label: "Delivery receipts",
        defaultEnabled: true,
      },
      {
        key: "templateFallback",
        label: "Template fallback",
        defaultEnabled: true,
      },
    ],
  },
  telegram: {
    status: "Server managed",
    description: "Telegram Bot API token is managed on the server.",
    fields: [],
    events: [],
  },
};

export function getDefaultChannelApiSettings(
  channelId: CanvasChannelId,
): CanvasChannelApiSettings {
  const config = channelSettingsConfig[channelId];

  return {
    fields: Object.fromEntries(
      config.fields.map((field) => [field.key, field.defaultValue]),
    ),
    enabledEvents: Object.fromEntries(
      config.events.map((event) => [event.key, event.defaultEnabled]),
    ),
  };
}

export function mergeChannelApiSettings(
  channelId: CanvasChannelId,
  storedSettings?: CanvasChannelApiSettings,
): CanvasChannelApiSettings {
  const config = channelSettingsConfig[channelId];

  return {
    fields: Object.fromEntries(
      config.fields.map((field) => [
        field.key,
        storedSettings?.fields[field.key] ?? field.defaultValue,
      ]),
    ),
    enabledEvents: Object.fromEntries(
      config.events.map((event) => [
        event.key,
        storedSettings?.enabledEvents[event.key] ?? event.defaultEnabled,
      ]),
    ),
  };
}

export function buildChannelApiSettings(
  storedSettings: Partial<Record<CanvasChannelId, CanvasChannelApiSettings>> = {},
) {
  return {
    whatsapp: mergeChannelApiSettings("whatsapp", storedSettings.whatsapp),
    telegram: mergeChannelApiSettings("telegram", storedSettings.telegram),
  };
}
