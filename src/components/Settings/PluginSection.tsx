import { useAtom } from "jotai";
import { settingsAtom } from "@/store";
import { usePluginManager } from "@/plugins/usePluginManager";
import { Card, Toggle, MenuRow, CodeIcon } from "@tomato-mien/ui";

export function PluginSection() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const pluginManager = usePluginManager();
  const plugins = pluginManager.getPluginList();

  if (plugins.length === 0) return null;

  const enabledPlugins = settings.enabledPlugins ?? [];

  const handleToggle = (pluginId: string, checked: boolean) => {
    const next = checked
      ? [...enabledPlugins, pluginId]
      : enabledPlugins.filter(id => id !== pluginId);
    setSettings({ ...settings, enabledPlugins: next });
  };

  return (
    <div className="mt-6">
      <span className="text-overline text-subtle-foreground mb-2 block">
        Plugins
      </span>
      <Card padding="none">
        {plugins.map((plugin, index) => (
          <MenuRow
            key={plugin.id}
            className={
              index < plugins.length - 1 ? "border-border-muted border-b" : ""
            }
          >
            <MenuRow.Icon icon={CodeIcon} />
            <MenuRow.Label
              title={plugin.name}
              description={plugin.description ?? `v${plugin.version}`}
            />
            <Toggle
              checked={enabledPlugins.includes(plugin.id)}
              onChange={checked => handleToggle(plugin.id, checked)}
            />
          </MenuRow>
        ))}
      </Card>
      <p className="text-caption text-muted-foreground mt-2">
        Changes take effect after restarting the app.
      </p>
    </div>
  );
}
