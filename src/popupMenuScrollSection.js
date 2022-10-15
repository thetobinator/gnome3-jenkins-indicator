/**
 * @author Philipp Hoffmann
 */

const Lang = imports.lang;
const { GObject, St, Gtk} = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const ServerPopupMenuItem = Me.imports.src.serverPopupMenuItem;
const Utils = Me.imports.src.helpers.utils;

/*
 * Server name and link in the popup menu.
 */
// :TODO: :TO: this class does not really work, but it's unused nowadays
var PopupMenuScrollSection = GObject.registerClass( 
class PopupMenuScrollSection extends GObject.Object {
	_init() {
		super._init();
		
		this.scrollView = new St.ScrollView({ style_class: 'vfade applications-scrollbox' });
		this.scrollView.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
		this.box = new St.BoxLayout({ style_class: 'popup-combobox-item', vertical: true, style:'spacing: 0px' });

		this.scrollView.add_actor(this.box);

		this.actor = this.scrollView;
		this.actor._delegate = this;
	}
});

