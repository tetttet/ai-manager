import type { FormEvent } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  PlugZap,
  Trash2,
  TriangleAlert,
  Webhook,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AgentChannel } from "@/lib/agent-channel-api";
import type {
  CanvasChannelApiSettings,
  CanvasChannelId,
} from "@/lib/agent-connections";
import { cn } from "@/lib/utils";

import { channelSettingsConfig } from "./channel-settings-config";
import { channelNodes } from "./constants";

type ChannelSettingsPanelProps = {
  channelId: CanvasChannelId | null;
  settings?: CanvasChannelApiSettings;
  onFieldChange: (
    channelId: CanvasChannelId,
    fieldKey: string,
    value: string,
  ) => void;
  onToggleEvent: (channelId: CanvasChannelId, eventKey: string) => void;
  channelStatus?: AgentChannel | null;
  isChannelActionPending?: boolean;
  channelActionError?: string | null;
  onConnectTelegram?: (botToken: string) => Promise<void>;
  onDisconnectTelegram?: () => Promise<void>;
  onClose: () => void;
};

type TelegramSettingsProps = {
  channelStatus?: AgentChannel | null;
  isPending: boolean;
  actionError?: string | null;
  onConnect?: (botToken: string) => Promise<void>;
  onDisconnect?: () => Promise<void>;
};

function formatConnectedAt(value?: string | null) {
  if (!value) {
    return "Not connected";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Connected";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatOptionalDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getWebhookStatusLabel(
  status: AgentChannel["webhookStatus"] | undefined,
) {
  switch (status) {
    case "registered":
      return "Registered";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return "Not registered";
  }
}

function getWebhookStatusClassName(
  status: AgentChannel["webhookStatus"] | undefined,
) {
  switch (status) {
    case "registered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "failed":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-500";
  }
}

function TelegramSettings({
  channelStatus,
  isPending,
  actionError,
  onConnect,
  onDisconnect,
}: TelegramSettingsProps) {
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramFormError, setTelegramFormError] = useState<string | null>(
    null,
  );
  const isConnected = channelStatus?.status === "connected";
  const webhookStatus = channelStatus?.webhookStatus ?? "not_configured";
  const visibleError = telegramFormError || actionError || null;

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const botToken = telegramBotToken.trim();

    if (!botToken) {
      setTelegramFormError("Telegram bot token is required.");
      return;
    }

    if (!onConnect) {
      return;
    }

    try {
      setTelegramFormError(null);
      await onConnect(botToken);
      setTelegramBotToken("");
    } catch {
      // The parent keeps the safe, user-facing error message in state.
    }
  }

  async function handleDisconnect() {
    if (!onDisconnect) {
      return;
    }

    try {
      setTelegramFormError(null);
      await onDisconnect();
    } catch {
      // The parent keeps the safe, user-facing error message in state.
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-zinc-200 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-950">
              <CheckCircle2
                className={cn(
                  "size-3.5",
                  isConnected ? "text-emerald-600" : "text-zinc-400",
                )}
              />
              Telegram bot
            </p>
            <p className="mt-1 truncate text-[12px] text-zinc-500">
              {channelStatus?.botDisplayName ?? "No bot connected"}
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "rounded-sm text-[10px]",
              isConnected
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-500",
            )}
          >
            {channelStatus?.tokenConfigured ? "Token saved" : "No token"}
          </Badge>
        </div>

        <div className="mt-3 grid gap-2 text-[11px] text-zinc-500">
          <div className="flex items-center justify-between gap-3">
            <span>Username</span>
            <span className="truncate font-medium text-zinc-700">
              {channelStatus?.botUsername
                ? `@${channelStatus.botUsername}`
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Connected</span>
            <span className="truncate font-medium text-zinc-700">
              {formatConnectedAt(channelStatus?.connectedAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <Webhook className="size-3" />
              Webhook
            </span>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-sm text-[10px]",
                getWebhookStatusClassName(webhookStatus),
              )}
            >
              {getWebhookStatusLabel(webhookStatus)}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Registered</span>
            <span className="truncate font-medium text-zinc-700">
              {formatOptionalDate(channelStatus?.webhookRegisteredAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Last update</span>
            <span className="truncate font-medium text-zinc-700">
              {formatOptionalDate(channelStatus?.lastUpdateReceivedAt)}
            </span>
          </div>
        </div>

        {channelStatus?.webhookStatus === "failed" &&
        channelStatus.webhookLastError ? (
          <div className="mt-3 flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium leading-4 text-red-700">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            <span>{channelStatus.webhookLastError}</span>
          </div>
        ) : null}
      </div>

      <form className="space-y-3" onSubmit={handleConnect}>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-600">
            <PlugZap className="size-3.5" />
            Bot token
          </span>
          <Input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={telegramBotToken}
            placeholder="123456789:AA..."
            className="h-9 rounded-sm border-zinc-200 bg-white text-[12px]"
            disabled={isPending}
            onChange={(event) => setTelegramBotToken(event.target.value)}
          />
        </label>

        <Button
          type="submit"
          size="sm"
          className="h-8 w-full rounded-sm text-[12px] font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <PlugZap className="size-3.5" />
          )}
          {isConnected ? "Update bot" : "Connect bot"}
        </Button>
      </form>

      {visibleError ? (
        <div className="flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium leading-4 text-red-700">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{visibleError}</span>
        </div>
      ) : null}

      {isConnected ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-8 w-full rounded-sm text-[12px] font-semibold"
          disabled={isPending}
          onClick={handleDisconnect}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Disconnect bot
        </Button>
      ) : null}
    </div>
  );
}

export function ChannelSettingsPanel({
  channelId,
  settings,
  onFieldChange,
  onToggleEvent,
  channelStatus,
  isChannelActionPending = false,
  channelActionError,
  onConnectTelegram,
  onDisconnectTelegram,
  onClose,
}: ChannelSettingsPanelProps) {
  const channel = channelNodes.find((item) => item.id === channelId) ?? null;
  const config = channelId ? channelSettingsConfig[channelId] : null;
  const ChannelIcon = channel?.icon;
  const isTelegram = channel?.id === "telegram";
  const isTelegramConnected =
    isTelegram && channelStatus?.status === "connected";
  const telegramStatusLabel = isTelegramConnected
    ? "Connected"
    : "Disconnected";

  return (
    <AnimatePresence>
      {channel && config && settings ? (
        <motion.aside
          key={channel.id}
          className="absolute bottom-4 right-4 top-20 z-30 flex w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-xl"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-sm border",
                  channel.accentClassName,
                )}
              >
                {ChannelIcon ? <ChannelIcon className="size-5" /> : null}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[14px] font-semibold text-zinc-950">
                  {channel.name} API
                </h3>
                <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                  {config.description}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-sm"
              aria-label="Close channel settings"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </header>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-zinc-200 bg-zinc-50 p-3">
              <span className="text-[12px] font-medium text-zinc-700">
                Connection status
              </span>
              <Badge
                variant="outline"
                className={cn("rounded-sm text-[10px]", channel.badgeClassName)}
              >
                {isTelegram ? telegramStatusLabel : config.status}
              </Badge>
            </div>

            {isTelegram ? (
              <TelegramSettings
                channelStatus={channelStatus}
                isPending={isChannelActionPending}
                actionError={channelActionError}
                onConnect={onConnectTelegram}
                onDisconnect={onDisconnectTelegram}
              />
            ) : (
              <>
                {config.fields.length > 0 ? (
                  <div className="space-y-3">
                    {config.fields.map((field) => {
                      const Icon = field.icon;

                      return (
                        <label key={field.key} className="block">
                          <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-600">
                            <Icon className="size-3.5" />
                            {field.label}
                          </span>
                          <Input
                            type={field.secret ? "password" : "text"}
                            value={settings.fields[field.key] ?? ""}
                            className="h-9 rounded-sm border-zinc-200 bg-white text-[12px]"
                            onChange={(event) =>
                              onFieldChange(
                                channel.id,
                                field.key,
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {config.events.length > 0 ? (
                  <div className="mt-5 rounded-sm border border-zinc-200">
                    <div className="border-b border-zinc-200 px-3 py-2">
                      <p className="text-[12px] font-semibold text-zinc-950">
                        Enabled events
                      </p>
                    </div>
                    <div className="divide-y divide-zinc-100">
                      {config.events.map((event) => {
                        const isEnabled =
                          settings.enabledEvents[event.key] ??
                          event.defaultEnabled;

                        return (
                          <div
                            key={event.key}
                            className="flex items-center justify-between gap-3 px-3 py-2"
                          >
                            <span className="text-[12px] text-zinc-600">
                              {event.label}
                            </span>
                            <button
                              type="button"
                              aria-label={`Toggle ${event.label}`}
                              aria-pressed={isEnabled}
                              className={cn(
                                "h-5 w-9 rounded-full border p-0.5 transition-colors",
                                isEnabled
                                  ? "border-emerald-200 bg-emerald-100"
                                  : "border-zinc-200 bg-zinc-100",
                              )}
                              onClick={() =>
                                onToggleEvent(channel.id, event.key)
                              }
                            >
                              <span
                                className={cn(
                                  "block size-4 rounded-full transition-transform",
                                  isEnabled
                                    ? "translate-x-4 bg-emerald-600"
                                    : "translate-x-0 bg-zinc-400",
                                )}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <p className="mt-3 text-[11px] leading-4 text-zinc-400">
                  Changes are saved to the database for this bot.
                </p>
              </>
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
