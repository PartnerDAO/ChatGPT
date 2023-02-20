use crate::{
  app::window,
  conf::{self, AppConf},
  utils,
};
use tauri::{
  AppHandle, CustomMenuItem, Manager, Menu, MenuItem, Submenu, SystemTray, SystemTrayEvent,
  SystemTrayMenu, SystemTrayMenuItem, WindowMenuEvent,
};
use tauri_plugin_positioner::{on_tray_event, Position, WindowExt};

#[cfg(target_os = "macos")]
use tauri::AboutMetadata;

// --- Menu
pub fn init() -> Menu {
  let app_conf = AppConf::read();
  let name = "ChatGPT";
  let app_menu = Submenu::new(
    name,
    Menu::with_items([
      #[cfg(target_os = "macos")]
      MenuItem::About(name.into(), AboutMetadata::default()).into(),
      #[cfg(not(target_os = "macos"))]
      CustomMenuItem::new("about".to_string(), "关于 ChatGPT").into(),
      CustomMenuItem::new("check_update".to_string(), "检查更新").into(),
      MenuItem::Services.into(),
      MenuItem::Hide.into(),
      MenuItem::HideOthers.into(),
      MenuItem::ShowAll.into(),
      MenuItem::Separator.into(),
      MenuItem::Quit.into(),
    ]),
  );

  let stay_on_top =
    CustomMenuItem::new("stay_on_top".to_string(), "置顶").accelerator("CmdOrCtrl+T");
  let stay_on_top_menu = if app_conf.stay_on_top {
    stay_on_top.selected()
  } else {
    stay_on_top
  };

  let theme_light = CustomMenuItem::new("theme_light".to_string(), "亮色");
  let theme_dark = CustomMenuItem::new("theme_dark".to_string(), "暗色");
  let theme_system = CustomMenuItem::new("theme_system".to_string(), "跟随系统");
  let is_dark = app_conf.clone().theme_check("dark");
  let is_system = app_conf.clone().theme_check("system");

  let update_prompt = CustomMenuItem::new("update_prompt".to_string(), "提示更新");
  let update_silent = CustomMenuItem::new("update_silent".to_string(), "静默更新");
  // let _update_disable = CustomMenuItem::new("update_disable".to_string(), "Disable");

  let popup_search = CustomMenuItem::new("popup_search".to_string(), "弹出搜索");
  let popup_search_menu = if app_conf.popup_search {
    popup_search.selected()
  } else {
    popup_search
  };

  #[cfg(target_os = "macos")]
  let titlebar = CustomMenuItem::new("titlebar".to_string(), "Titlebar").accelerator("CmdOrCtrl+B");
  #[cfg(target_os = "macos")]
  let titlebar_menu = if app_conf.titlebar {
    titlebar.selected()
  } else {
    titlebar
  };

  let system_tray = CustomMenuItem::new("system_tray".to_string(), "系统托盘");
  let system_tray_menu = if app_conf.tray {
    system_tray.selected()
  } else {
    system_tray
  };

  let auto_update = app_conf.get_auto_update();
  let preferences_menu = Submenu::new(
    "首选项",
    Menu::with_items([
      CustomMenuItem::new("control_center".to_string(), "控制中心")
        .accelerator("CmdOrCtrl+Shift+P")
        .into(),
      MenuItem::Separator.into(),
      stay_on_top_menu.into(),
      #[cfg(target_os = "macos")]
      titlebar_menu.into(),
      #[cfg(target_os = "macos")]
      CustomMenuItem::new("hide_dock_icon".to_string(), "隐藏Dock图标").into(),
      system_tray_menu.into(),
      CustomMenuItem::new("inject_script".to_string(), "脚本注入")
        .accelerator("CmdOrCtrl+J")
        .into(),
      MenuItem::Separator.into(),
      Submenu::new(
        "主题",
        Menu::new()
          .add_item(if is_dark || is_system {
            theme_light
          } else {
            theme_light.selected()
          })
          .add_item(if is_dark {
            theme_dark.selected()
          } else {
            theme_dark
          })
          .add_item(if is_system {
            theme_system.selected()
          } else {
            theme_system
          }),
      )
      .into(),
      Submenu::new(
        "关于更新",
        Menu::new()
          .add_item(if auto_update == "prompt" {
            update_prompt.selected()
          } else {
            update_prompt
          })
          .add_item(if auto_update == "silent" {
            update_silent.selected()
          } else {
            update_silent
          }), // .add_item(if auto_update == "disable" {
              //     update_disable.selected()
              // } else {
              //     update_disable
              // })
      )
      .into(),
      MenuItem::Separator.into(),
      popup_search_menu.into(),
      CustomMenuItem::new("sync_prompts".to_string(), "同步 Prompts").into(),
      MenuItem::Separator.into(),
      CustomMenuItem::new("go_conf".to_string(), "打开配置目录")
        .accelerator("CmdOrCtrl+Shift+G")
        .into(),
      CustomMenuItem::new("restart".to_string(), "重启 ChatGPT")
        .accelerator("CmdOrCtrl+Shift+R")
        .into(),
      CustomMenuItem::new("clear_conf".to_string(), "清除配置").into(),
      MenuItem::Separator.into(),
      CustomMenuItem::new("buy_coffee".to_string(), "Buy lencx a coffee").into(),
    ]),
  );

  let edit_menu = Submenu::new(
    "编辑",
    Menu::new()
      .add_native_item(MenuItem::Undo)
      .add_native_item(MenuItem::Redo)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Cut)
      .add_native_item(MenuItem::Copy)
      .add_native_item(MenuItem::Paste)
      .add_native_item(MenuItem::SelectAll),
  );

  let view_menu = Submenu::new(
    "浏览",
    Menu::new()
      .add_item(CustomMenuItem::new("go_back".to_string(), "返回").accelerator("CmdOrCtrl+["))
      .add_item(CustomMenuItem::new("go_forward".to_string(), "前进").accelerator("CmdOrCtrl+]"))
      .add_item(
        CustomMenuItem::new("scroll_top".to_string(), "回到顶部").accelerator("CmdOrCtrl+Up"),
      )
      .add_item(
        CustomMenuItem::new("scroll_bottom".to_string(), "滚动到底部")
          .accelerator("CmdOrCtrl+Down"),
      )
      .add_native_item(MenuItem::Separator)
      .add_item(
        CustomMenuItem::new("zoom_0".to_string(), "缩放到实际大小").accelerator("CmdOrCtrl+0"),
      )
      .add_item(CustomMenuItem::new("zoom_out".to_string(), "缩小").accelerator("CmdOrCtrl+-"))
      .add_item(CustomMenuItem::new("zoom_in".to_string(), "放大").accelerator("CmdOrCtrl+Plus"))
      .add_native_item(MenuItem::Separator)
      .add_item(CustomMenuItem::new("reload".to_string(), "刷新").accelerator("CmdOrCtrl+R")),
  );

  let window_menu = Submenu::new(
    "界面",
    Menu::new()
      .add_item(CustomMenuItem::new(
        "app_website".to_string(),
        "ChatGPT 用户指南",
      ))
      .add_item(CustomMenuItem::new("dalle2".to_string(), "DALL·E 2"))
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Minimize)
      .add_native_item(MenuItem::Zoom),
  );

  let help_menu = Submenu::new(
    "帮助",
    Menu::new()
      .add_item(CustomMenuItem::new(
        "chatgpt_log".to_string(),
        "ChatGPT 日志",
      ))
      .add_item(CustomMenuItem::new("update_log".to_string(), "更新记录"))
      .add_item(CustomMenuItem::new("report_bug".to_string(), "Bug反馈"))
      .add_item(
        CustomMenuItem::new("dev_tools".to_string(), "打开开发者工具")
          .accelerator("CmdOrCtrl+Shift+I"),
      ),
  );

  Menu::new()
    .add_submenu(app_menu)
    .add_submenu(preferences_menu)
    .add_submenu(window_menu)
    .add_submenu(edit_menu)
    .add_submenu(view_menu)
    .add_submenu(help_menu)
}

// --- Menu Event
pub fn menu_handler(event: WindowMenuEvent<tauri::Wry>) {
  let win = Some(event.window()).unwrap();
  let app = win.app_handle();
  let script_path = utils::script_path().to_string_lossy().to_string();
  let menu_id = event.menu_item_id();
  let menu_handle = win.menu_handle();

  match menu_id {
    // App
    "about" => {
      let tauri_conf = utils::get_tauri_conf().unwrap();
      tauri::api::dialog::message(
        app.get_window("core").as_ref(),
        "ChatGPT",
        format!("Version {}", tauri_conf.package.version.unwrap()),
      );
    }
    "check_update" => {
      utils::run_check_update(app, false, None);
    }
    // Preferences
    "control_center" => window::cmd::control_window(app),
    "restart" => tauri::api::process::restart(&app.env()),
    "inject_script" => open(&app, script_path),
    "go_conf" => utils::open_file(utils::app_root()),
    "clear_conf" => utils::clear_conf(&app),
    "app_website" => window::cmd::wa_window(
      app,
      "app_website".into(),
      "ChatGPT User's Guide".into(),
      conf::APP_WEBSITE.into(),
      None,
    ),
    "buy_coffee" => open(&app, conf::BUY_COFFEE.to_string()),
    "popup_search" => {
      let app_conf = AppConf::read();
      let popup_search = !app_conf.popup_search;
      menu_handle
        .get_item(menu_id)
        .set_selected(popup_search)
        .unwrap();
      app_conf
        .amend(serde_json::json!({ "popup_search": popup_search }))
        .write();
      window::cmd::window_reload(app.clone(), "core");
      window::cmd::window_reload(app, "tray");
    }
    "sync_prompts" => {
      tauri::api::dialog::ask(
        app.get_window("core").as_ref(),
        "同步 Prompts",
        "数据同步将启用所有Prompts，您确定要同步吗?",
        move |is_restart| {
          if is_restart {
            app
              .get_window("core")
              .unwrap()
              .eval("window.__sync_prompts && window.__sync_prompts()")
              .unwrap()
          }
        },
      );
    }
    "hide_dock_icon" => {
      AppConf::read()
        .amend(serde_json::json!({ "hide_dock_icon": true }))
        .write()
        .restart(app);
    }
    "titlebar" => {
      let app_conf = AppConf::read();
      app_conf
        .clone()
        .amend(serde_json::json!({ "titlebar": !app_conf.titlebar }))
        .write()
        .restart(app);
    }
    "system_tray" => {
      let app_conf = AppConf::read();
      app_conf
        .clone()
        .amend(serde_json::json!({ "tray": !app_conf.tray }))
        .write()
        .restart(app);
    }
    "theme_light" | "theme_dark" | "theme_system" => {
      let theme = match menu_id {
        "theme_dark" => "dark",
        "theme_system" => "system",
        _ => "light",
      };
      AppConf::read()
        .amend(serde_json::json!({ "theme": theme }))
        .write()
        .restart(app);
    }
    "update_prompt" | "update_silent" | "update_disable" => {
      // for id in ["update_prompt", "update_silent", "update_disable"] {
      for id in ["update_prompt", "update_silent"] {
        menu_handle.get_item(id).set_selected(false).unwrap();
      }
      let auto_update = match menu_id {
        "update_silent" => {
          menu_handle
            .get_item("update_silent")
            .set_selected(true)
            .unwrap();
          "silent"
        }
        "update_disable" => {
          menu_handle
            .get_item("update_disable")
            .set_selected(true)
            .unwrap();
          "disable"
        }
        _ => {
          menu_handle
            .get_item("update_prompt")
            .set_selected(true)
            .unwrap();
          "prompt"
        }
      };
      AppConf::read()
        .amend(serde_json::json!({ "auto_update": auto_update }))
        .write();
    }
    "stay_on_top" => {
      let app_conf = AppConf::read();
      let stay_on_top = !app_conf.stay_on_top;
      menu_handle
        .get_item(menu_id)
        .set_selected(stay_on_top)
        .unwrap();
      win.set_always_on_top(stay_on_top).unwrap();
      app_conf
        .amend(serde_json::json!({ "stay_on_top": stay_on_top }))
        .write();
    }
    // Window
    "dalle2" => window::dalle2_window(&app, None, None, Some(false)),
    // View
    "zoom_0" => win.eval("window.__zoom0 && window.__zoom0()").unwrap(),
    "zoom_out" => win.eval("window.__zoomOut && window.__zoomOut()").unwrap(),
    "zoom_in" => win.eval("window.__zoomIn && window.__zoomIn()").unwrap(),
    "reload" => win.eval("window.location.reload()").unwrap(),
    "go_back" => win.eval("window.history.go(-1)").unwrap(),
    "go_forward" => win.eval("window.history.go(1)").unwrap(),
    "scroll_top" => win
      .eval(
        r#"window.scroll({
          top: 0,
          left: 0,
          behavior: "smooth"
          })"#,
      )
      .unwrap(),
    "scroll_bottom" => win
      .eval(
        r#"window.scroll({
          top: document.body.scrollHeight,
          left: 0,
          behavior: "smooth"})"#,
      )
      .unwrap(),
    // Help
    "chatgpt_log" => utils::open_file(utils::app_root().join("chatgpt.log")),
    "update_log" => open(&app, conf::UPDATE_LOG_URL.to_string()),
    "report_bug" => open(&app, conf::ISSUES_URL.to_string()),
    "dev_tools" => {
      win.open_devtools();
      win.close_devtools();
    }
    _ => (),
  }
}

// --- SystemTray Menu
pub fn tray_menu() -> SystemTray {
  if cfg!(target_os = "macos") {
    let mut tray_menu = SystemTrayMenu::new()
      .add_item(CustomMenuItem::new(
        "control_center".to_string(),
        "控制中心",
      ))
      .add_native_item(SystemTrayMenuItem::Separator);

    if AppConf::read().hide_dock_icon {
      tray_menu = tray_menu.add_item(CustomMenuItem::new(
        "show_dock_icon".to_string(),
        "显示 Dock 图标",
      ));
    } else {
      tray_menu = tray_menu
        .add_item(CustomMenuItem::new(
          "hide_dock_icon".to_string(),
          "隐藏 Dock 图标",
        ))
        .add_item(CustomMenuItem::new("show_core".to_string(), "显示窗口"));
    }

    SystemTray::new().with_menu(
      tray_menu
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "退出")),
    )
  } else {
    SystemTray::new().with_menu(
      SystemTrayMenu::new()
        .add_item(CustomMenuItem::new(
          "control_center".to_string(),
          "控制中心",
        ))
        .add_item(CustomMenuItem::new("show_core".to_string(), "Show Window"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "退出")),
    )
  }
}

// --- SystemTray Event
pub fn tray_handler(handle: &AppHandle, event: SystemTrayEvent) {
  on_tray_event(handle, &event);

  let app = handle.clone();

  match event {
    SystemTrayEvent::LeftClick { .. } => {
      let app_conf = AppConf::read();

      if !app_conf.hide_dock_icon {
        if let Some(core_win) = handle.get_window("core") {
          core_win.minimize().unwrap();
        }
      }

      if let Some(tray_win) = handle.get_window("tray") {
        tray_win.move_window(Position::TrayCenter).unwrap();

        if tray_win.is_visible().unwrap() {
          tray_win.hide().unwrap();
        } else {
          tray_win.show().unwrap();
        }
      }
    }
    SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
      "control_center" => window::cmd::control_window(app),
      "restart" => tauri::api::process::restart(&handle.env()),
      "show_dock_icon" => {
        AppConf::read()
          .amend(serde_json::json!({ "hide_dock_icon": false }))
          .write()
          .restart(app);
      }
      "hide_dock_icon" => {
        let app_conf = AppConf::read();
        if !app_conf.hide_dock_icon {
          app_conf
            .amend(serde_json::json!({ "hide_dock_icon": true }))
            .write()
            .restart(app);
        }
      }
      "show_core" => {
        if let Some(core_win) = app.get_window("core") {
          let tray_win = app.get_window("tray").unwrap();
          if !core_win.is_visible().unwrap() {
            core_win.show().unwrap();
            core_win.set_focus().unwrap();
            tray_win.hide().unwrap();
          }
        };
      }
      "quit" => std::process::exit(0),
      _ => (),
    },
    _ => (),
  }
}

pub fn open(app: &AppHandle, path: String) {
  tauri::api::shell::open(&app.shell_scope(), path, None).unwrap();
}
