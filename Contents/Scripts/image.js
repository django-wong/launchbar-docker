/**
 * List images to display in LaunchBar
 *
 * @return     {Array}
 */
function list_images(name = '.') {
	const result = (LaunchBar.execute(BIN_DOCKER, 'image', 'ls', '--format', '{{json .}}') || '').trim();
	if (!result) {
		return [];
	}

	const res = result.split('\n').map(line => JSON.parse(line)).filter(
		filter_by([{key: 'Repository', value: name}])
	).map(format_image);

	return res;
}

/**
 * Format image to display in Launchbar
 *
 * @param      {object}  image   The image
 * @return     {Object}
 */
function format_image(image) {
	return {
		title              : image.Repository,
		badge              : image.Tag,
		label              : image.Size,
		icon               : ICONS.IMAGE,
		action             : 'show_image',
		actionReturnsItems : true,
		actionArgument     : image
	}
}

/**
 * Display image detail in LaunchBar
 *
 * @param      {image}  image   The image
 * @return     {Array}
 */
function show_image(image) {
	const items = [{
		title              : 'More Actions',
		icon               : ICONS.MORE,
		action             : 'show_image_actions',
		actionReturnsItems : true,
		actionArgument     : image
	}];

	items.push({
		icon  : ICONS.REPOSITORY,
		title : image.Repository,
		label : 'Repository',
	});

	items.push({
		icon  : ICONS.TAG,
		title : image.Tag,
		label : 'Tag',
	});

	items.push({
		icon  : ICONS.HASH,
		title : image.ID,
		label : 'ID',
	});

	items.push({
		icon  : ICONS.SIZE,
		title : image.Size,
		label : 'Size',
	});

	items.push({
		icon  : ICONS.COUNT_DOWN,
		title : image.CreatedSince,
		label : 'Created Since',
	});

	items.push({
		icon  : ICONS.DATE,
		title : image.CreatedAt,
		label : 'Created At',
	});

	return items;
}

function show_image_actions(image) {
	const items = [];

	items.push({
		actionReturnsItems: true,
		action: 'execute',
		title: 'Remove the selected image',
		badge: 'rm',
		actionArgument: {
			need_confirm: true,
			target: image.ID,
			command: 'rmi',
			bin: BIN_DOCKER,
			variants: [
				{ options: ['-f'], description: 'Force remove the selected image' }
			]
		},
		icon: ICONS.EXEC
	})

	items.push({
		actionReturnsItems: true,
		action: 'execute',
		badge: 'pull',
		title: 'Pull an image from the registry',
		actionArgument: {
			need_confirm: true,
			target: image.ID,
			command: 'image',
			bin: BIN_DOCKER,
			operation: 'pull',
		},
		icon: ICONS.EXEC
	});

	items.push({
		actionReturnsItems: true,
		action: 'execute',
		badge: 'push',
		title: 'Push an image to a registry',
		actionArgument: {
			need_confirm: true,
			target: image.ID,
			command: 'image',
			bin: BIN_DOCKER,
			operation: 'pull',
		},
		icon: ICONS.EXEC
	});

	items.push({
		actionArgument: image,
		action: 'save_image',
		badge: '(take a while to) save',
		title: 'Save image to a tar archive',
		actionReturnsItems: true,
		icon: ICONS.EXEC
	});

	items.push({
		title: 'Show the history of the selected image',
		actionReturnsItems: true,
		action: 'execute',
		actionArgument: {
			options: ['--format', '"{{json .}}"'],
			target: image.ID,
			operation: 'history',
			bin: BIN_DOCKER,
			command: 'image',
			formater: 'view_image_history_output'
		},
		icon: ICONS.EXEC,
		badge: 'history',
	})

	return items;
}

/**
 * Saves specified image to tar file.
 *
 * @param      {image}  image   The image
 * @return     {Array}
 */
function save_image(image) {
	const target_file = `${Action.cachePath}/${image.ID}.tar`;
	LaunchBar.execute(BIN_DOCKER, 'image', 'save', '-o', target_file, image.ID);
	return [{ path: target_file }];
}

/**
 * Display image's history content in LaunchBar
 *
 * @param      {string}  [content='']  The content
 * @return     {items}
 */
function view_image_history_output(content) {
	return content.trim().split('\n').map(line => JSON.parse(line)).map(item => {
		return {
			title: item.CreatedBy,
			label: item.Size
		};
	});
}