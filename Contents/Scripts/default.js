// LaunchBar Action Script

include('icons.js');
include('common.js');
include('compose-file.js');
include('container.js');
include('exec.js');
include('image.js');
include('network.js');
include('service.js');
include('volume.js');

/**
 * The entrypoint of the action
 *
 * @param      {string}  [input='']  The input
 * @return     {items}
 */
function run(input = '') {
	const more_options = [ALL_CONTAINERS, ALL_IMAGES, ALL_VOLUMES];
	const items = [];

	if (input) {
		// List containers and images by keyword
		items.push(...list_containers(input, false));
		items.push(...list_images(input));
	} else {
		// List running containers
		items.push(...list_containers('', true));
	}

	if (items.length > 1) {
		items.push({
			title: 'More Options',
			children: more_options,
			icon: ICONS.MORE
		});

		return items;
	}

	return more_options;
}

function runWithPaths(paths = []) {
	return use_compose_files(paths);
}