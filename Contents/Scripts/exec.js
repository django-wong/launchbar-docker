// APLICATION <-f FILE> COMMAND <OPTIONS> <SERVICE> <EXECUTABLE> <ARGS>

const BIN_DOCKER_COMPOSE = '/usr/local/bin/docker-compose';
const BIN_DOCKER = '/usr/local/bin/docker';

/**
 * List command's variants to execute
 *
 * @param      {object}  options  The options
 * @return     {items}
 */
function list_variants_to_execute(options) {
	return options.variants.map(variant => ({
		title: variant.description,
		icon: ICONS.EXEC,

		badge: variant.options ? variant.options.join(' ') : undefined,
		action: 'execute',

		actionArgument: {
			...options,
			variants: undefined,
			...variant,
		},

		actionReturnsItems: true,
	}));
}

/**
 * Execute a command
 *
 * @param      {object}  options  The options
 * @return     {items}
 */
function execute(options) {
	const bin = options.bin || BIN_DOCKER_COMPOSE, parts = [bin];

	if (options.file) {
		parts.push('-f', options.file);
	}

	if (!options.command) {
		LaunchBar.alert('Missing command');
		return;
	}

	parts.push(options.command);

	if (options.operation) {
		parts.push(options.operation);
	}

	parts.push(...(options.options || []));

	if (options.target) {
		parts.push(options.target);
	}

	if (options.executable) {
		parts.push(options.executable);
	}

	parts.push(...(options.args || []));

	// The finnal command to execute
	const command = parts.join(' ');

	options.preview_text = options.preview_text || command;

	// Go to list variants of this command
	if (LaunchBar.options.alternateKey) {
		if (options.variants) {
			return list_variants_to_execute(options);
		}
	}

	// Ask user to double confirm to run this command
	if (options.need_confirm) {
		if (!LaunchBar.options.commandKey) {
			return confirm_to_execute(options, command);
		}
	}

	// Run command in terminal.app
	const run_in_terminal = options.run_in_terminal || LaunchBar.options.controlKey;
	if (run_in_terminal) {
		return LaunchBar.performAction(
			'Run Terminal Command',
			command
		);
	}

	// Execute the command and retrive the output
	const result = LaunchBar.execute(
		'/bin/bash', '-c', command, '2>&1'
	);

	if (!options.formater) return result || 'Fail to execure the command';

	// Invoke another action to review the ouptut
	return view_command_result(result, options.formater);
}

/**
 * Performs an action.
 *
 * @param      {object}  options  The options
 */
function preform_action(options) {
	LaunchBar.performAction(options.action, options.argument);
}

/**
 * Confirm to exec the command
 *
 * @param      {object}  options  The options
 * @param      {string}  command  The command
 * @return     {items}
 */
function confirm_to_execute(options, command) {
	options.need_confirm = false;

	const run_in_terminal = {
		label: 'Press <enter> to execut in Ternimal',
		actionArgument: {
			actoin: 'Run Terminal Command',
			argument: command,
		},
		action: 'preform_action',
		title: command,
		icon: ICONS.EXEC,
	};

	const items = [];

	items.push({
		title: 'Are you sure to preform the command?',
		label: 'Option ⌘ to Skip this ',
		subtitle: command,
		alwaysShowsSubtitle: true,
		icon: ICONS.QUESTION,
		children: [run_in_terminal],
	});

	items.push({
		action: 'execute', title: 'Yes',
		label: 'Press ⌃ to open in Terminal',
		icon: ICONS.YES,
		actionArgument: options,
		actionReturnsItems: true,
	})

	items.push({
		title: 'No', icon: ICONS.NO
	});

	return items;
}

/**
 * call action to view the result
 *
 * @param      {string}  content         The content
 * @param      {string}  action_to_call  The action to call
 * @return     {items}
 */
function view_command_result(content, action_to_call) {
	return [{
		actionReturnsItems: true,
		actionArgument: content,
		action: action_to_call,
		icon: ICONS.OPEN_EXTRA,
		title: 'View Result'
	}];
}