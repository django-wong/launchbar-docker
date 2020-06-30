function list_volumes(name = '.') {
	const result = (
		LaunchBar.execute(
			BIN_DOCKER, 'volume', 'ls', "--format", "{{json .}}"
		) || ""
	).trim();

	if (!result) {
		return [];
	}

	return result.split('\n')
	.map(JSON.parse)
	.filter(filter_by([{key: 'Name', value: name}]))
	.map(format_volume);
}

function format_volume(volume) {
	return {
		title: volume.Name,
		badge: volume.Driver,
		icon: ICONS.VOLUME,
		action: 'show_volume',
		actionReturnsItems: true,
		actionArgument: volume
	}
}

function show_volume(volume) {
	const items = [{
		title: volume.Name,
		icon: ICONS.MORE,
		action: 'show_volume_actions',
		actionReturnsItems: true,
		actinoArgument: volume
	}];

	items.push({
		icon: ICONS.SIZE,
		title: volume.Size,
		label: 'Size',
	});

	items.push({
		icon: ICONS.VOLUME,
		title: volume.Driver,
		label: 'Driver'
	});

	items.push({
		title: volume.Mountpoint,
		icon: ICONS.PATH,
		label: 'Mountpoint'
	});

	return items;
}

function show_volume_actions(volume) {
	const items = [{
		icon: ICONS.EXEC,
		title: 'Remove the volume',
		badge: 'rm, remove',
		actionReturnsItems: true,
		action: 'execute',
		actionArgument: {
			need_confirm: true,
			command: 'volume',
			operation: 'rm',
			target: volume.Name,
			bin: BIN_DOCKER,
		}
	}];

	return items;
}