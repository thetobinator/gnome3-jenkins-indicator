/**
 * @author Philipp Hoffmann
 */

const Lang = imports.lang;
const { GObject, St, Gio } = imports.gi;
const Mainloop = imports.mainloop;
const Glib = imports.gi.GLib;
const Soup = imports.gi.Soup;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.src.helpers.utils;
const Icon = Me.imports.src.helpers.icon;
const ServerPopupMenu = Me.imports.src.serverPopupMenu;

// set text domain for localized strings
const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

/*
 * Represents the indicator in the top menu bar.
 */

var JenkinsIndicator = GObject.registerClass(
class JenkinsIndicator extends PanelMenu.Button {

	_init(settings, httpSession) {
		super._init(0.25, _('Jenkins Indicator'));

		// the number of the server this indicator refers to
		this.settings = settings;
		this.httpSession = httpSession;

		// start off with no jobs to display
		this.jobs = [];

		// we will use this later to add a notification source as soon as a notification needs to be displayed
		this.notification_source;

		// lock used to prevent multiple parallel update requests
		this._isRequesting = false;

		// start off with a blue overall indicator
		this._iconActor = Icon.createStatusIcon(Utils.jobStates.getIcon(Utils.jobStates.getDefaultState(), this.settings.green_balls_plugin));
		this.add_actor(this._iconActor);

		// add server popup menu
		this.menuWrapper = new ServerPopupMenu.ServerPopupMenu(this, this.actor, 0.25, St.Side.TOP, this.notification_source, this.settings, this.httpSession);
		
		this.setMenu(this.menuWrapper.menu);

		// refresh when indicator is clicked
		this.connect("button-press-event", Lang.bind(this, this.request));

		// enter main loop for refreshing
		this._mainloopInit();
	}

	_mainloopInit() {
		// create new main loop
		this._mainloop = Mainloop.timeout_add(this.settings.autorefresh_interval*1000, Lang.bind(this, function(){
			// request new job states if auto-refresh is enabled
			if( this.settings.autorefresh ) {
				this.request();
			}

			// returning true is important for restarting the mainloop after timeout
			return true;
		}));
	}

	// request local jenkins server for current state
	request() {
		// only update if no update is currently running
		if( !this._isRequesting ) {
			this._isRequesting = true;
			// ajax request to local jenkins server
			let request = Soup.Message.new('GET', Utils.urlAppend(this.settings.jenkins_url, 'api/json'));

			// append authentication header (if necessary)
			// jenkins only supports preemptive authentication so we have to provide authentication info on first request
			if( this.settings.use_authentication ) {
				request.request_headers.append('Authorization', 'Basic ' + Glib.base64_encode(this.settings.auth_user + ':' + this.settings.api_token));
			}

			if( request ) {
				this.httpSession.queue_message(request, Lang.bind(this, function(httpSession, message) {
					// http error
					if( message.status_code!==200 )	{
						this.showError(_("Invalid Jenkins CI Server web frontend URL (HTTP Error %s)").format(message.status_code));
					}
					// http ok
					else {
						// parse json
						try {
							let jenkinsState = JSON.parse(request.response_body.data);

							// update jobs
							this.jobs = jenkinsState.jobs;

							// update indicator (icon and popupmenu contents)
							this.update();
						}
						catch( e ) {
							global.log(e)
							this.showError(_("Invalid Jenkins CI Server web frontend URL"));
						}
					}

					// we're done updating and ready for the next request
					this._isRequesting = false;
				}));
			}
			// no valid url was provided in settings dialog
			else {
				this.showError(_("Invalid Jenkins CI Server web frontend URL"));

				// we're done updating and ready for the next request
				this._isRequesting = false;
			}
		}
	}

	// update indicator icon and popupmenu contents
	update() {
		// filter jobs to be shown
		let displayJobs = Utils.filterJobs(this.jobs, this.settings);

		// update popup menu
		this.menuWrapper.updateJobs(displayJobs);

		// update overall indicator icon

		// default state of overall indicator
		let overallState = Utils.jobStates.getDefaultState();

		// set state to red if there are no jobs
		if( displayJobs.length<=0 ) {
			overallState = Utils.jobStates.getErrorState();
		}
		else {
			// determine jobs overall state for the indicator
			for( let i=0 ; i<displayJobs.length ; ++i )	{
				// set overall job state to highest ranked (most important) state
				if( Utils.jobStates.getRank(displayJobs[i].color)>-1 && Utils.jobStates.getRank(displayJobs[i].color)<Utils.jobStates.getRank(overallState) ) {
					overallState = displayJobs[i].color;
				}
			}
		}

		// set new overall indicator icon representing current jenkins state
		this._iconActor.gicon = Utils.loadIcon(Utils.jobStates.getIcon(overallState, this.settings.green_balls_plugin));
	}

	// update settings
	updateSettings(settings) {
		this.settings = settings;

		// update server menu item
		this.menuWrapper.updateSettings(this.settings);

		// refresh main loop
		Mainloop.source_remove(this._mainloop);
		this._mainloopInit();

		this.update();
	}

	// displays an error message in the popup menu
	showError(text) {
		// set default error message if none provided
		text = text || "unknown error";

		// remove all job menu entries and previous error messages
		this.menuWrapper.jobSection.removeAll();

		// show error message in popup menu
		this.menuWrapper.jobSection.addMenuItem( new PopupMenu.PopupMenuItem(_("Error") + ": " + text, {style_class: 'error'}) );

		// set indicator state to error
		this._iconActor.gicon = Utils.loadIcon(Utils.jobStates.getIcon(Utils.jobStates.getErrorState(), this.settings.green_balls_plugin));
	}

	// destroys the indicator
	destroy() {
		// destroy the mainloop used for updating the indicator
		Mainloop.source_remove(this._mainloop);

		// destroy notification source if used
		if( this.notification_source )
			this.notification_source.destroy();
		super.destroy();
	}
});

