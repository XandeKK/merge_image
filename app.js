document.getElementById('files').addEventListener('change', (evt)=> {
	const files = Array.from(evt.target.files);
	const parent = document.getElementById('images');
	let index_image = 0;
	const files_length = files.length;

	files.forEach(file=> {
		const div = document.createElement('div');
		const img = document.createElement('img');
		const input = document.createElement('input');

		parent.appendChild(div);
		div.appendChild(img);
		div.appendChild(input);

		div.className = 'relative mx-auto';

		const reader = new FileReader();

		reader.addEventListener('load', ()=> {
			img.src = reader.result;
			img.setAttribute('loaded', 1);
		});

		reader.readAsDataURL(file);

		input.className = 'absolute right-1 bottom-1 w-12 bg-zinc-600 rounded p-1';
		input.type = 'number';
		input.name = 'group';
		input.value = 0;

		input.addEventListener('change', (evt)=> {
			const number_id = evt.target.id.replace('input-', '');
			document.getElementById(number_id).setAttribute('group', evt.target.value);
			organize_group(number_id, parseInt(evt.target.value));
		});

		img.id = index_image;
		input.id = 'input-' + index_image;
		index_image++;
	});
	
	const intervalId = setInterval(()=> {
		set_group(intervalId);
	}, 1000);
});

function organize_group(id, group_id) {
	let sum_height = 0;
	const limit_heigth = 5000;
	const images = document.querySelectorAll('img');
	for (var i = parseInt(id); i < images.length; i++) {
		const img = images[i];
		sum_height += img.naturalHeight;
		if (sum_height >= limit_heigth) {
			group_id += 1;
			sum_height = img.naturalHeight;
		}
		document.getElementById('input-' + img.id).value = group_id;
		img.setAttribute('group', group_id);
	}
}

function set_group(intervalId) {
	let group_id = 0;
	let sum_height = 0;
	const limit_heigth = 5000;
	const images = document.querySelectorAll('img');
	for (var i = 0; i < images.length; i++) {
		const img = images[i];
		if (img.getAttribute('loaded') == null) {
			return false;
		}
		sum_height += img.naturalHeight;
		if (sum_height >= limit_heigth) {
			group_id += 1;
			sum_height = img.naturalHeight;
		}
		document.getElementById('input-' + img.id).value = group_id;
		img.setAttribute('group', group_id);
	}
	clearInterval(intervalId);
	return true;
}

document.getElementById('save').addEventListener('click', () => {
	const images = document.querySelectorAll('img');
	const results = [];
	let imgs = [];
	let current_group_id = '0';
	for (var i = 0; i < images.length; i++) {
		const img = images[i];
		const group_id = img.getAttribute('group');

		if (group_id != current_group_id) {
			results.push({name: current_group_id + '.png', data: joinImagesVertically(...imgs)});
			current_group_id = group_id;
			imgs = [];
		}

		imgs.push(img);
	}
	results.push({name: current_group_id + '.png', data: joinImagesVertically(...imgs)});

    const zip = new JSZip();
    results.forEach(result => {
    	zip.file(result.name, result.data.split(',')[1], {base64: true});
    });

    zip.generateAsync({type: 'blob'}).then(function(content) {
	    const url = URL.createObjectURL(content);
	    const a = document.createElement('a');
	    a.href = url;
	    a.download = 'images.zip';
	    a.click();
	});

});

function joinImagesVertically(...images) {
    // create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // calculate the total height of all images
    let totalHeight = 0;
    for (const img of images) {
        totalHeight += img.height;
    }

    // set the canvas size to fit all images
    canvas.width = images[0].width;
    canvas.height = totalHeight;

    // draw the images on the canvas, one below the other
    let currentY = 0;
    for (const img of images) {
        ctx.drawImage(img, 0, currentY);
        currentY += img.height;
    }

    // return the resulting image data
    return canvas.toDataURL();
}
