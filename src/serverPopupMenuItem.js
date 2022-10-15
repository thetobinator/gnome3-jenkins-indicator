/**
 * @author Philipp Hoffmann
 */

const Lang = imports.lang;
const { GObject, St, Gio } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.src.helpers.utils;
const Icon = Me.imports.src.helpers.icon;

/*
 * Server name and link in the popup menu.
 */
var ServerPopupMenuItem = GObject.registerClass(
class ServerPopupMenuItem extends PopupMenu.PopupBaseMenuItem {

	_init(settings, params) {
		super._init(params);
		
		this.settings = settings;
		
		this.box = new St.BoxLayout({ style_class: 'popup-combobox-item' });
		this.icon = Icon.createStatusIcon('jenkins_headshot');
		this.label = new St.Label({ text: this.settings.name });

		this.box.add(this.icon);
		this.box.add(this.label);

		// For Gnome 3.8 and below
		if( typeof this.addActor != 'undefined' ) {
			this.addActor(this.box);
		}
		// For Gnome 3.10 and above
		else {
			this.add_child(this.box);
		}
		
		// clicking the server menu item opens the servers web frontend with default browser
		this.connect("activate", Lang.bind(this, function(){
			Gio.app_info_launch_default_for_uri(this.settings.jenkins_url, global.create_app_launch_context(0, -1));
		}));
	}

	// update menu item label (server name)
	updateSettings(settings) {
		this.settings = settings;
		this.label.text = this.settings.name;
	}
});
