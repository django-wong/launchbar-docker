const DOCKER_COMPOSE_SERVICE_IMAGE_REGEX = /(?<contaier>^\S.*?)\s{3,}(?<repo>\S.*?)\s{2,}(?<tag>\S.*?)\s{2,}(?<image_id>\S+)\s{2,}(?<size>.+)$/;

const NO_CONTAINER_WAS_FOUND = {
	title: 'No Container Was Found',
	icon: ICONS.EMPTY,
};

const NO_IMAGE_WAS_FOUND = {
	title: 'No Image Was Found',
	icon: ICONS.EMPTY,
}

const SEPERATOR = '|';

const INVALID_COMPOSE_FILE = {
	title: 'Invalid Docker Compose File',
	icon: ICONS.BAD
}

const NO_IMAGE_WAS_FOUND_FOR_SERVICE = {
	title: 'No image was found for specified service',
	icon: '118878 - face sad.png'
}

const ALL_IMAGES = {
	actionReturnsItems: true,
	title: 'All Images',
	icon: ICONS.IMAGE,
	action: 'list_images',
};

const ALL_CONTAINERS = {
	actionReturnsItems: true,
	title: 'All Containers',
	icon: ICONS.CONTAINER,
	action: 'list_containers',
};

const ALL_VOLUMES = {
	actionReturnsItems: true,
	title: 'All Volumes',
	icon: ICONS.VOLUME,
	action: 'list_volumes',
}

/**
 * Filter projects by
 *
 * @param      {Array<Object>}  objects  The objects you want to filter
 * @param      {Array<Filter>}  filters  The filters
 * @return     {Objects}
 */
function filter_by(filters = []) {
	return function(object) {
        for (const filter of filters) {
            if (object[filter.key].match(RegExp(filter.value || '.', 'i'))) return true;
        }
	}
}