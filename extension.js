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

function findSiblingWindow(window) {
    // Only vertically maximized windows can have a sibling
    if (window.get_maximized() !== Meta.MaximizeFlags.VERTICAL) {
        return null;
    }
    let windows = window.get_display().get_workspace_manager().get_active_workspace();
    for (let candidateWindow of windows) {
        // Only consider other windows
        let isOtherWindow = candidateWindow !== window;
        // Only consider windows on the same monitor
        let isSameMonitor = window.get_monitor() === candidateWindow.get_monitor();
        // Only consider vertically maximized windows
        let isVerticallyMaximized = candidateWindow.get_maximized() === Meta.MaximizeFlags.VERTICAL;
        if (isOtherWindow && isSameMonitor && isVerticallyMaximized) {
            return candidateWindow;
        }
    }
    return null;
}
