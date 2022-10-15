/**
 * @author Philipp Hoffmann
 */

const Lang = imports.lang;
const { GObject, St } = imports.gi;
const MessageTray = imports.ui.messageTray;
const SessionMessageTray = imports.ui.main.messageTray;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.src.helpers.utils;
const Icon = Me.imports.src.helpers.icon;

/*
 * Source for handling job notifications.
 */
var JobNotificationSource = GObject.registerClass(
class JobNotificationSource extends MessageTray.Source {

	_init(title) {
		// set notification source title

		super._init(title, 'jenkins_headshot');

		// set notification source icon
		this._setSummaryIcon(this.createNotificationIcon());
		
		// add myself to the message try
		SessionMessageTray.add(this);
	}

	// set jenkins logo for notification source icon
	createNotificationIcon() {
		return Icon.createNotificationIcon('jenkins_headshot');
	}

	// gets called when a notification is clicked
	open(notification) {
		// close the clicked notification
		notification.destroy();
	}
});


