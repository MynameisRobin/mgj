// https://github.com/michael-ciniawsky/postcss-load-config
module.exports = {
	plugins: {
		"postcss-import": {},
		"postcss-preset-env": {
			"stage": 3,
			features: {
				'nesting-rules': true
			}
		},
		"cssnano": {}
	}
}