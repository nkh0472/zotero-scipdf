import { config } from "../../package.json";
import { sciHubCustomResolver } from "./CustomResolver";
import { CustomResolverManager } from "./CustomResolverManager";

export async function registerPrefsScripts(_window: Window) {
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
    };
  } else {
    addon.data.prefs.window = _window;
  }
  const autoDownloadCheckbox = _window.document.querySelector(`#zotero-prefpane-${config.addonRef}-autoDownload`) as XUL.Checkbox;
  const urlInput = _window.document.querySelector(`#zotero-prefpane-${config.addonRef}-scihubUrl`) as HTMLInputElement;

  const resolver = CustomResolverManager.shared.customResolvers;
  autoDownloadCheckbox.checked = resolver.length > 0 && resolver[0].automatic !== false;
  urlInput.value = resolver.length > 0 ? resolver[0].url : "";

  const validURL = (url?: string) => {
    return url && url.length > 0;
    // return url?.includes('{doi}') === true;
  };
  const updateResolver = () => {
    CustomResolverManager.shared.removeAllCustomResolversInZotero();
    if (validURL(urlInput.value.trim())) {
      CustomResolverManager.shared.appendCustomResolversInZotero([sciHubCustomResolver(urlInput.value.trim(), autoDownloadCheckbox.checked)]);
      urlInput.value = CustomResolverManager.shared.customResolvers[0].url;
    } else {
      new ztoolkit.ProgressWindow(config.addonName, {
        closeOnClick: true,
        closeTime: 3000,
      }).createLine({
        text: `URL Error`,
        type: 'fail',
        progress: 0
      }).show();
    }
  }
  autoDownloadCheckbox.addEventListener("command", e => {
    updateResolver();
  });

  urlInput.addEventListener("change", e => {
    updateResolver();
  });
}
