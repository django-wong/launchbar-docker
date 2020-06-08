/**
 * List all services with service name
 *
 * @param      {string}          file    The file
 * @return     {Array}
 */
function list_services_name(file) {
	const result = execute(
		{command: 'ps', options: ['--services'], file}
	);

	if (!result) return [];

	return result.trim().split('\n').map(service => {
		return {
			title: service,
			service_name: service,
			icon: ICONS.SERVICE,
		}
	})
}

/**
 * List all services and display in LaunchBar
 *
 * @param      {string}  file    The file
 * @return     {Array}
 */
function list_services(file) {
	if (!is_valid_compose_file(file)) return [INVALID_COMPOSE_FILE];
	const options = {
		command: 'ps',
		options: ['-a'],
		file: file
	};
	const result = (execute(options) || '').trim();

	if (!result) {
		return [];
	}

	const items = result.split('\n').slice(2)
	.map(extrac_service_info)
	.filter(data => !!data)
	.map(format_service_info);

	if (items.length < 1) {
		return [];
	}

	items.unshift({
		title              : 'More Actions',
		icon               : ICONS.MORE,
		action             : 'show_service_actions',
		actionReturnsItems : true,
		actionArgument     : file
	});

	return items;
}

/**
 * Determines whether the specified file is valid compose file.
 *
 * @param      {string}   file    The file
 * @return     {boolean}
 */
function is_valid_compose_file(file) {
	const options = { file, command: 'config' };
	return !!execute(options);
}

/**
 * Extrac service info from line
 *
 * @param      {string}             [content='']  The content
 * @return     {object}
 */
function extrac_service_info(content = '') {
	const match = content.match(/(?<service_name>^\S.*?)\s{3,}(?<command>\S.*?)\s{2,}(?<state>\S.*?)\s{2,}(?<ports>.*)$/);
	return match ? match.groups : null;
}

/**
 * Format service info to display in Launchbar
 *
 * @param      {servie}  service  The service
 * @return     {Object}
 */
function format_service_info(service) {
	return {
		title: service.service_name,
		badge: service.state,
		icon: ICONS.SERVICE,
	}
}

/**
 * Shows the service actions.
 *
 * @param      {file}  file    The file
 */
function show_service_actions(file) {
	const items = [];

	// kill
	items.push({
		icon: ICONS.EXEC,
		badge: 'kill',
		title: 'Kill containers',
		action: "choose_service_to_execute",
		actionArgument: {
			command: 'kill',
			file,
			need_confirm: true,
		}
	});

	const DOCKER_COMPOSE_BUILD_VARIANTS = [
		{options: ['--compress'], description: 'Compress the build context using gzip'},
		{options: ['--force-rm'], description: 'Always remove intermediate containers'},
		{options: ['--no-cache'], description: 'Do not use cache when building the image'},
		{options: ['--no-rm'], description: 'Do not remove intermediate containers after a successful build'},
		{options: ['--parallel'], description: 'Build images in parallel'},
		{options: ['--parallel'], description: 'Build images in parallel'},
		{options: ['--progress', 'auto'], description: 'Set type of progress output to "auto"'},
		{options: ['--progress', 'plain'], description: 'Set type of progress output to "plain"'},
		{options: ['--progress', 'tty'], description: 'Set type of progress output to "tty"'},
		{options: ['--pull'], description: 'Always attempt to pull a newer version of the image'},
		{options: ['--q'], description: 'Don\'t print anything to STDOUT'},
	];

	// build
	items.push({
		icon: ICONS.EXEC,
		badge: 'build',
		title: 'Build or rebuild services',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'build',
			file,
			variants: DOCKER_COMPOSE_BUILD_VARIANTS
		}
	});

	// confit
	items.push({
		icon: ICONS.EXEC,
		badge: 'config',
		title: 'Validate and view the Compose file',
		action: "execute",
		actionArgument: {
			command: 'config',
			file,
			run_in_terminal: true
		}
	});

	const CREATE_VARIANTS = [
		{options: ['--force-recreate'], description: 'Recreate even if their configuration and image haven\'t changed'},
		{options: ['--no-recreate'], description: 'If containers already exist, don\'t recreate them'},
		{options: ['--no-build'], description: 'Don\'t build an image, even if it\'s missing'},
		{options: ['--build'], description: 'Build images before creating containers'},
	]

	// create
	items.push({
		icon: ICONS.EXEC,
		badge: 'create',
		title: 'Create services',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'create',
			file,
			variants: CREATE_VARIANTS,
		}
	});

	const DOWN_VARIANTS = [
		{options: ['--rmi', 'all'], description: 'Remove all images used by any service'},
		{options: ['--rmi', 'local'], description: 'Remove only images that don\'t have a custom tag'},
	];

	// down
	items.push({
		icon: ICONS.EXEC,
		badge: 'down',
		title: 'Stop and remove containers, networks, img and vols...',
		action: "execute",
		actionArgument: {
			need_confirm: true,
			command: 'down',
			file,
			variants: DOWN_VARIANTS
		}
	});

	const EXECUTE_IN_DETACHED_MODE = [
		{options: ['-d'], description: 'Detached mode: Run command in the background', run_in_terminal: false}
	];

	const EXEC_VARIANTS = [
		{description: 'sh', badge: '/bin/sh', executable: '/bin/sh', variants: EXECUTE_IN_DETACHED_MODE},
	]

	// exec
	items.push({
		icon: ICONS.EXEC,
		badge: 'exec bash',
		title: 'Execute a command in a running container',
		action: "choose_service_to_execute",
		actionArgument: {
			required: true,
			need_confirm: true,
			command: 'execute',
			file,
			executable: '/bin/bash',
			run_in_terminal: true,
			variants: EXEC_VARIANTS
		}
	});

	// images
	items.push({
		icon: ICONS.EXEC,
		badge: 'images',
		title: 'List images',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'images',
			file,
			formater: 'listServiceImages'
		}
	});

	const LOGS_VARIANTS = [
		{description: 'Produce monochrome output', options: ['--no-color']},
		{description: 'Follow log output', options: ['-f'], run_in_terminal: true},
		{description: 'Show timestamps', options: ['-t']},
		{description: 'Show last 10 lines of the logs', options: ['--tail=10']}
	];

	// logs
	items.push({
		icon: ICONS.EXEC,
		badge: 'logs',
		title: 'View output from containers',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'logs',
			file,
			variants: LOGS_VARIANTS
		}
	});

	// pause
	items.push({
		icon: ICONS.EXEC,
		badge: 'pause',
		title: 'Pause services',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'pause',
			file,
		}
	});

	const PULL_VARIANTS = [
		{options: ['--ignore-pull-failures'], description: 'Pull what it can and ignores images with pull failures'},
		{options: ['--parallel'], description: 'Deprecated, pull multiple images in parallel (enabled by default)'},
		{options: ['--no-parallel'], description: 'Disable parallel pulling'},
		{options: ['-q'], description: 'Pull without printing progress information'},
		{options: ['--include-deps'], description: 'Also pull services declared as dependencies'},
	]

	// pull
	items.push({
		icon: ICONS.EXEC,
		badge: 'pull',
		title: 'Pull service images (Open in Terminal)',
		action: "choose_service_to_execute",
		actionArgument: {
			command: 'pull',
			file,
			run_in_terminal: true,
			variants: PULL_VARIANTS
		}
	});

	const PUSH_VARIANTS = [
		{options: ['--ignore-push-failures'], description: 'Push what it can and ignores images with push failures'}
	]

	// push
	items.push({
		icon: ICONS.EXEC,
		badge: 'push',
		title: 'Push service images (Open in Terminal)',
		action: "choose_service_to_execute",
		actionArgument: {
			command: 'push',
			file,
			run_in_terminal: true,
			variants: PUSH_VARIANTS
		}
	});

	const RESTART_VARIANTS = [
		{description: 'Shutdown service in 5 seconds, default 10s', options: ['-t', '5']}
	]

	// restart
	items.push({
		icon: ICONS.EXEC,
		badge: 'restart',
		title: 'Restart services',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'restart',
			file,
			variants: RESTART_VARIANTS
		}
	});

	const REMOVE_VARIANTS = [
		{options: [], description: "Ask to confirm removal (Open in Terminal)", run_in_terminal: true},
		{options: ['-s'], description: "Stop the containers, if required, before removing"},
		{options: ['-v'], description: "Remove any anonymous volumes attached to containers"},
	]

	// remove
	items.push({
		icon: ICONS.EXEC,
		badge: 'rm',
		title: 'Remove stopped containers',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'rm',
			file,
			options: ['-f'],
			variants: REMOVE_VARIANTS
		}
	});

	// start
	items.push({
		icon: ICONS.EXEC,
		badge: 'start',
		title: 'Start services',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'start',
			file,
		}
	});

	const STOP_VARIANTS = [
		{description: 'Shutdown service in 5 seconds, default 10s', options: ['-t', '5']}
	]

	// stop
	items.push({
		icon: ICONS.EXEC,
		badge: 'stop',
		title: 'Stop services',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'stop',
			file,
			variants: STOP_VARIANTS
		}
	});

	// top
	items.push({
		icon: ICONS.EXEC,
		badge: 'top',
		title: 'Display the running processes',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'top',
			file,
		}
	});

	// unpause
	items.push({
		icon: ICONS.EXEC,
		badge: 'unpause',
		title: 'Unpause services',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'unpause',
			file,
		}
	});

	const UP_VARIANTS = [
		{options: [], description: 'Run in Attached Mode', run_in_terminal: true},
		{options: ['--no-color'], description: 'Produce monochrome output.', run_in_terminal: true},
		{options: ['--quiet-pull'], description: 'Pull without printing progress information',run_in_terminal: true},
		{options: ['--no-deps'], description: 'Don\'t start linked services.',run_in_terminal: true},
		{options: ['--force-recreate'], description: 'Recreate container.',run_in_terminal: true},
		{options: ['--always-recreate-deps'],description: 'Recreate dependent containers.',run_in_terminal: true},
		{options: ['--no-recreate'],description: 'If containers already exist, don\'t recreate them',run_in_terminal: true},
		{options: ['--no-build'],description: 'Don\'t build an image, even if it\'s missing.',run_in_terminal: true},
		{options: ['--no-start'],description: 'Don\'t start the services after creating them.',run_in_terminal: true},
		{options: ['--build'],description: 'Build images before starting containers.',run_in_terminal: true},
	]

	// up
	items.push({
		icon: ICONS.EXEC,
		badge: 'up',
		title: 'Create and start containers (Detached Mode)',
		action: "choose_service_to_execute",
		actionArgument: {
			need_confirm: true,
			command: 'up',
			file,
			options: ['-d'],
			variants: UP_VARIANTS
		}
	});

	const VERSION_VARIANTS = [
		{description: 'Shows only Compose\'s version number.', options: '--short'}
	];

	//versions
	items.push({
		icon: ICONS.VERSIONS,
		badge: 'version',
		title: 'Show the Docker-Compose version information',
		action: "execute",
		actionArgument: {
			command: 'version',
			file,
			variants: VERSION_VARIANTS
		}
	});

	return items;
}

/**
 * Choose a service to execute the command
 *
 * @param      {object}  options  The options
 * @return     {Array}
 */
function choose_service_to_execute(options) {
	if (LaunchBar.options.alternateKey) {
		if (options.variants) {
			return list_variants_to_execute(options).map(a => {
				a.action = 'choose_service_to_execute';
				return a;
			})
		}
	}

	const services = list_services_name(options.file);

	if (services.length < 1) {
		return [NO_SERVICE_WAS_FOUND];
	}

	if (!options.required && services.length > 1) {
		services.unshift({
			title: `[All ${services.length} services]`,
			icon: ICONS.ALL,
			service_name: undefined,
		})
	}

	const items = services.map(service => {
		return {
			...service,
			actionReturnsItems: true,
			action: 'execute',
			actionArgument: {
				...options,
				target: service.service_name
			}
		}
	});

	items.unshift({
		title: 'Choose a service to continue...',
		icon: ICONS.QUESTION,
		action: 'choose_service_to_execute',
		actionArgument: options,
		actionReturnsItems: true,
	});

	return items;
}

/**
 * Extra image info from `docker-compose images` output
 *
 * @param      {string}  content  The content
 * @return     {Array<{
 *     title: string,
 *     action: 'findImages'
 * }>}
 */
function listServiceImages(content) {
	content = (content || '').trim();

	if (!content) {
		return [
			NO_IMAGE_WAS_FOUND_FOR_SERVICE
		];
	}

	const data = content.split('\n').splice(2).map(line => {
		const match = line.match(
			DOCKER_COMPOSE_SERVICE_IMAGE_REGEX
		);
		return match ? match.groups : null
	}).filter(data => !!data);

	if (data.length < 1) {
		return [
			NO_IMAGE_WAS_FOUND_FOR_SERVICE
		];
	}

	return data.map(item => ({
		icon: ICONS.IMAGE,
		actionReturnsItems: true,
		title: item.repo,
		label: item.size,
		badge: item.tag,
		action: 'list_images',
		actionArgument: item.repo
	}))
}