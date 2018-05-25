// import uglify from 'rollup-plugin-uglify';

export default [
	{
		input: 'src/custom-button.js',
		output: {
			file: 'custom-button.js',
      name: 'CustomButton',
			format: 'iife',
			sourcemap: false
		}
	}
]
