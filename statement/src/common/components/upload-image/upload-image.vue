<template>
	<div class="am_upload_image" v-if="dialogVisible">
		<el-dialog title="上传图片" width="513px" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="dialogVisible">
			<div class="am_upload_image-content" v-loading="loading">
				<div class="am_upload_image-cropper">
					<vue-cropper ref='cropper' :guides="true" :background="true" :view-mode="1" :auto-crop-area="1" :img-style="styleObject" :container-style="styleObject" :aspect-ratio="1" preview=".upload_image_preview" :src="imgSrc">
					</vue-cropper>
					<div class="am_upload_image-action">
						<el-button size="medium">
							重新选择
							<input @change="handleSelectFile" class="am_upload_image-input" type="file" accept="image/*">
						</el-button>
						<el-button size="medium" type="primary" @click="onSaveImage">上传图片</el-button>
					</div>
				</div>
				<div class="am_upload_image-preview">
					<div class="upload_image_preview"></div>
					<div class="upload_image_preview--medium upload_image_preview"></div>
					<div class="upload_image_preview--small upload_image_preview"></div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	import VueCropper from 'vue-cropperjs'
	import Utils from '@/js/utils'
	import Api from '@/api'
	import {getPicture} from '@/utils/imgConfig'
	export default {
		name: 'AmUploadImage',
		components: {
			VueCropper
		},
		data() {
			return {
				dialogVisible: true,
				styleObject: {
					width: '348px',
					height: '348px'
				},
				imgSrc: '',
				uploadOption: null,
				loading: false,
			}
		},
		methods: {
			handleSelectFile(e) {
				const file = e.target.files[0];
				let that = this
				Utils.renderFileAsDataURL(file).then(result => {
					this.imgSrc = result;
					this.$refs.cropper.replace(result);
				})
			},
			open({imageSrc, uploadOption}) {
				this.imgSrc = imageSrc;
				this.dialogVisible = true;
				this.uploadOption = uploadOption;
			},
			cropImage() {
				return this.$refs.cropper.getCroppedCanvas().toDataURL();
			},
			async onSaveImage() {
				let uploadOption = this.uploadOption;
				let apiCfg = uploadOption.apiCfg;
				let imageBase64 = this.cropImage();
				const subIndex = imageBase64.indexOf(';base64,');
				imageBase64 = imageBase64.substr(subIndex + 8);
				let data = { ...uploadOption.apiCfg, imageBase64};
				this.loading = true;
				const res = await Api.uploadFileBase64(data);
				this.loading = false;
				const {content, code, message} = res.data;
				if ( code === "0") {
					this.resolve(res.data)
					this.dialogVisible = false;
				} else {
					this.reject(res.data)
				}
			}
		}
	}
</script>
<style lang="less">
	.am_upload_image-content {
		display: flex;
	}
	.am_upload_image-cropper {
		width: 348px;
	}
	.am_upload_image-action {
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
		& .el-button {
			position: relative;
			width: 152px;
			overflow: hidden;
		}
	}
	.am_upload_image-input {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		opacity: 0;
		z-index: 2;
		cursor: pointer;
	}
	.am_upload_image-preview {
		margin-left: 20px;
	}
	.upload_image_preview {
		width: 100px;
		height: 100px;
		overflow: hidden;
		border: 1px solid #DCDFE6;
	}
	.upload_image_preview~.upload_image_preview {
		margin-top: 15px;
	}
	.upload_image_preview--medium {
		width: 70px;
		height: 70px;
	}
	.upload_image_preview--small {
		width: 50px;
		height: 50px;
	}
</style>
