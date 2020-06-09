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
	const items = [];

	if (input) {
		items.push(...list_containers(input, false));
		items.push(...list_images(input));
	} else {
		items.push(...list_containers('', true));
		items.push(ALL_CONTAINERS, ALL_IMAGES);
	}

	if (items.length < 1) {
		return NO_ITEM;
	}

	return items;
}