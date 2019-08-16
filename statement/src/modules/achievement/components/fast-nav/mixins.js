export default {
	methods: {
		handleClick(name) {
			console.log(name);
			try {
				let el = document.querySelector(`#${name}`);
				// console.log(`${name}`, el, el.clientTop, el.offsetTop, el.offsetParent, el.offsetParent.offsetTop, el.getBoundingClientRect());
				if (el.offsetParent.offsetTop < 200) {
					document.documentElement.scrollTop = 0;
				} else {
					document.documentElement.scrollTop = el.offsetParent.offsetTop + el.offsetTop - 270;
				}

				// el.style.background = '#00AAEE';
				// let serTime = setTimeout( () => {
				// 	el.style.background = '#fff';
				// 	clearTimeout(serTime);
				// }, 1500);
			} catch (err) {
				console.log(err);
			}
		}
	}
}