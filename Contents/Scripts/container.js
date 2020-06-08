/**
 * List running containers
 *
 * @return     {Array}
 */
function list_containers(name = '', running_only = false) {
	const options = ['--format', '{{json .}}', '--no-trunc'];

	if (!running_only) {
		options.unshift('-a');
	}

	const result = (
		LaunchBar.execute(
			BIN_DOCKER, 'container', 'ls', ...options
		) || ''
	).trim();

	if (!result) {
		return [];
	}

	const res = result.split('\n').map(line => JSON.parse(line)).filter(
		filter_by([{key: 'Names', value: name}])
	).map(format_container);

	return res;
}

/**
 * Format container to dispay in launchbar
 *
 * @param      {object}  container  The container
 * @return     {Object}
 */
function format_container(container) {
	return {
		actionArgument     : container,
		title              : container.Names || '<noname>',
		icon               : ICONS.CONTAINER,
		label              : container.Status,
		action             : 'show_container',
		actionReturnsItems : true,
	}
}

/**
 * Disable container info in LaunchBar
 *
 * @param      {container}  container  The container
 * @return     {Array}
 */
function show_container(container) {
	const labels = {};
	container.Labels.split(',').map(pair => {
		const [key, value] = pair.split('=');
		labels[key] = value;
	});

	const items = [{
		title              : 'More Actions',
		icon               : ICONS.MORE,
		action             : 'show_container_actions',
		actionReturnsItems : true,
		actionArgument     : container
	}];

	const compose_info = extrac_compose_info(labels);
	items.push(...compose_info);

	if (container.Names) {
		items.push({
			title: container.Names,
			icon: ICONS.CONTAINER,
			label: 'Container Names'
		});
	}

	items.push({
		icon: ICONS.HASH,
		title: container.ID,
		label: 'Container ID'
	});

	items.push({
		icon: ICONS.IMAGE,
		title: container.Image,
		label: 'Images',
	})

	items.push({
		title: container.Command,
		label: 'Command',
		icon: ICONS.COMMAND,
	})

	items.push({
		icon: ICONS.DATE,
		title: container.CreatedAt,
		label: 'Created At'
	});

	items.push({
		icon: ICONS.COUNT_DOWN,
		title: container.RunningFor,
		label: 'Running For'
	});

	if (container.Ports) {
		items.push({
			icon: ICONS.PORTS,
			title: container.Ports,
			label: 'Ports'
		});
	}

	items.push({
		icon: ICONS.STATUS,
		title: container.Status,
		label: 'Status'
	});

	items.push({
		icon: ICONS.SIZE,
		title: container.Size,
		label: 'Size'
	});

	items.push({
		icon: ICONS.VOLUME,
		title: container.Mounts,
		label: 'Mounts'
	});

	items.push({
		icon: ICONS.NETWORK,
		title: container.Networks,
		label: 'Joined Networks'
	});



	items.push({
		title: 'Labels',
		icon: ICONS.TAG,
		children: Object.keys(labels).map(label => {
			return {
				title: labels[label], label: label
			}
		})
	});

	return items;
}

/**
 * Shows the container actions.
 *
 * @param      {container}  container  The container
 * @return     {Array}
 */
function show_container_actions(container) {
	const items = [];

	// attach
	items.push({
		title: 'Attach local standard input, output, and error streams to a running container',
		label: 'attach',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'attach',
			target: container.ID,
			run_in_terminal: true,
			need_confirm: false,
		},
	});

	// kill
	items.push({
		title: 'Kill one or more running containers',
		label: 'kill',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'kill',
			target: container.ID,
			need_confirm: false,
		},
	});

	// pause
	items.push({
		title: 'Pause all processes within one or more containers',
		label: 'pause',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'pause',
			target: container.ID,
			need_confirm: true,
		},
	});

	// start
	items.push({
		title: 'Start one or more stopped containers',
		label: 'start',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'start',
			target: container.ID,
			variants: [
				{
					options: ['-a'], open_in_terminal: true,
					description: 'Attach STDOUT/STDERR and forward signals',
				}
			],
			need_confirm: true,
		},
	});

	// stop
	items.push({
		title: 'Stop one or more running containers',
		label: 'stop',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'stop',
			target: container.ID,
			need_confirm: true,
		},
	});

	// top
	items.push({
		title: 'Display the running processes of a container',
		label: 'top',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'top',
			target: container.ID,
		},
	});

	// logs
	items.push({
		title: 'Fetch the last 100 line of logs of a container',
		label: 'logs',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'logs',
			target: container.ID,
			options: ['--tail', '100']
		},
	});

	// stats
	items.push({
		title: 'Display container(s) resource usage statistics',
		label: 'stats',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			formater: 'view_contaier_stats_output',
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'stats',
			options: ['--no-stream', '--format', '"{{json .}}"'],
			target: container.ID,
			variants: [
				{
					description: 'Display a live stream of container(s) resource usage statistics',
					options: [],
					formater: null,
					run_in_terminal: true
				}
			]
		},
	});

	// rm
	items.push({
		title: 'Remove one or more containers',
		label: 'rm',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'rm',
			target: container.ID,
			variants: [
				{
					description: 'Force the removal of a running container (uses SIGKILL)',
					options: ['--force']
				},
				{
					description: 'Remove anonymous volumes associated with the container',
					options: ['--volumes']
				},
				{
					description: 'Remove the specified link',
					options: ['--link']
				},
			]
		},
	});

	// unpause
	items.push({
		title: 'Unpause all processes within the containers',
		label: 'unpause',
		actionReturnsItems: true,
		icon: ICONS.EXEC,
		action: 'execute',
		actionArgument: {
			command: 'container',
			bin: BIN_DOCKER,
			operation: 'unpause',
			target: container.ID,
			need_confirm: true,
		},
	});

	return items;
}

/**
 * Display container stats output
 *
 * @param      {string}  output  The output
 * @return     {Array}
 */
function view_contaier_stats_output(output) {
	const data = JSON.parse(output.trim());
	const items = [];

	items.push({
		title: 'CPU %',
		badge: data.CPUPerc
	});

	items.push({
		title: 'Mem Perc',
		badge: data.MemPerc
	});

	items.push({
		title: 'Mem Usage',
		badge: data.MemUsage
	});

	items.push({
		title: 'Net IO',
		badge: data.NetIO
	});

	items.push({
		title: 'Block IO',
		badge: data.BlockIO
	});

	return items;
}

/**
 * Extrac docker-compose info from the labels
 *
 * @param      {object}  labels  The labels
 * @return     {Array}
 */
function extrac_compose_info(labels) {
	const items = [];

	if (!labels) {
		return items;
	}

	if (!labels['com.docker.compose.project.working_dir']) {
		return items;
	}


	const working_dir = labels['com.docker.compose.project.working_dir'];
	const compose = labels['com.docker.compose.project.config_files'];

	let compose_file = working_dir + '/' + compose;
	if (compose.indexOf('/') === 0) {
		compose_file = compose;
	}

	items.push({
		label: 'Docker Compose File',
		icon: ICONS.COMPOSE,
		title: 'Use this docker compose file',
		action: 'list_services',
		actionReturnsItems: true,
		actionArgument: compose_file
	});

	items.push({
		path: compose_file,
		label: 'Config File'
	});

	items.push({
		label: 'Work Dir',
		path: working_dir,
	});

	items.push({
		label: 'Service Name',
		title: labels['com.docker.compose.service'],
		icon: ICONS.SERVICE,
	});

	items.push({
		title: labels['com.docker.compose.project'],
		label: 'Project',
		icon: ICONS.PROJECT
	});

	return items;
}