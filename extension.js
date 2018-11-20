const Meta = imports.gi.Meta;

let focusWindowNotifyConnection = null;

function init() { }

function enable() {
    focusWindowNotifyConnection = global.display.connect(
        'notify::focus-window', onFocusWindowNotify
    );
}

function disable() {
    global.display.disconnect(focusWindowNotifyConnection);
}

function onFocusWindowNotify() {
    let focusedWindow = global.display.get_focus_window();
    if (focusedWindow) {
        let siblingWindow = findSiblingWindow(focusedWindow);
        if (siblingWindow) {
            // Raise the sibling window
            siblingWindow.raise();
            // Raise the focused window again so it's still on top of the sibling window
            focusedWindow.raise();
        }
    }
}

function getWorkspaceCompat(window) {
    if (window.get_screen) {
        // GNOME 3.28
        let screen = window.get_screen();
        return screen.get_active_workspace();
    } else {
        // GNOME 3.30
        let display = window.get_display();
        let workspaceManager = display.get_workspace_manager();
        return workspaceManager.get_active_workspace();
    }
}

function findSiblingWindow(window) {
    // Only vertically maximized windows can have a sibling
    if (window.get_maximized() !== Meta.MaximizeFlags.VERTICAL) {
        return null;
    }
    let windowRect = window.get_frame_rect();
    let workAreaRect = window.get_work_area_current_monitor();
    let windows = getWorkspaceCompat(window).list_windows();
    for (let candidateWindow of windows) {
        // Only consider other windows
        let isOtherWindow = candidateWindow !== window;
        // Only consider windows on the same monitor
        let isSameMonitor = window.get_monitor() === candidateWindow.get_monitor();
        // Only consider vertically maximized windows
        let isVerticallyMaximized = candidateWindow.get_maximized() === Meta.MaximizeFlags.VERTICAL;
        // Only consider windows that are horizontally tiled
        let candidateWindowRect = candidateWindow.get_frame_rect();
        let isHorizontallyTiled = horizontallyTiled(workAreaRect, candidateWindowRect, windowRect);
        if (isOtherWindow && isSameMonitor && isVerticallyMaximized && isHorizontallyTiled) {
            return candidateWindow;
        }
    }
    return null;
}

function horizontallyTiled(workAreaRect, aRect, bRect) {
      let leftRect = aRect;
      let rightRect = bRect;
      if (aRect.x > bRect.x) {
          leftRect = bRect;
          rightRect = aRect;
      }
      return (
          workAreaRect.x === leftRect.x &&
          // Work around this being off-by-one with Ubuntu Dock for some reason
          (
              leftRect.x + leftRect.width === rightRect.x ||
              leftRect.x + leftRect.width === rightRect.x + 1
          ) &&
          rightRect.x + rightRect.width === workAreaRect.x + workAreaRect.width
      );
}
