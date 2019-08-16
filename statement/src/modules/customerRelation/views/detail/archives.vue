<template>
	<div class="customer_archives">
		<div class="customer_archives-header">
			<h3 class="customer_archives-title">顾客档案</h3>
			<span class="customer_archives-total">共有{{ count }}条顾客档案</span>
			<a class="customer_archives-create" @click="openCreateDialog">
				<am-icon name="plus" is-element></am-icon>
			</a>
		</div>
		<empty-tips class="customer_archives-empty" v-if="!loading && (!ListData || ListData.length === 0)"></empty-tips>
		<ul class="history_box" v-loading="loading">
			<li v-for="item in ListData" :key="item.id">
				<div class="box_info">
					<div class="info">
						<p class="info-word" v-html="changearchives(item.archives)"></p>
						<p class="info-operation">
							<el-image class="customer_archives_item-avatar picavatar" :src="item.empAvatar">
								<am-icon slot="error" name="s-custom" is-element size="16px"></am-icon>
							</el-image>
							<span>{{item.userName}} -</span>
							<span>{{item.levelName}}</span>
							<span>{{item.timeLabel}}</span>
							<el-button type="text" @click="delCustomerArchives(item)">删除</el-button>
						</p>
					</div>
					<div class="imgs">
						<p class="info-pic" v-if="item.cover"><img  @click="viewDetail(item)" v-for="(subItem, index) in item.cover" :key="index" :src="subItem" alt="" :class="item.cover.length > 3 ? '' : ''"></img></p>
					</div>
				</div>
			</li>
		</ul>
		<el-dialog
			class="customer_archives_detail"
			:show-close="false"
			:visible.sync="detailVm.dialog"
			width="1189px"
			top="0">
			<div class="customer_archives_detail_close" @click="detailVm.dialog = false">
				<am-icon size="34px" name="fanhui"></am-icon>
			</div>
			<div class="customer_archives_detail-carousel" v-if="detailVm.dialog">
				<template v-if="detailVm.data.thumbnailList && detailVm.data.thumbnailList.length > 1">
					<span class="customer_archives_detail-carousel_prev" title="上一张" @click="onCarourselPrev">
						<am-icon name="xiangzuo1" size="43px"></am-icon>
					</span>
					<span class="customer_archives_detail-carousel_next" title="下一张" @click="onCarourselNext">
						<am-icon name="xiangyou" size="43px"></am-icon>
					</span>
					<el-carousel :interval="5000" height="500px" ref="carousel"
						arrow="never" indicator-position="none"
						@change="handleCarouselChange">
						<el-carousel-item v-for="item in detailVm.data.workImgList" :key="item">
							<img :src="item" width="100%" alt="档案图片">
						</el-carousel-item>
					</el-carousel>
				</template>
				<img v-else-if="detailVm.data.thumbnailList && detailVm.data.thumbnailList.length" width="500px" :src="detailVm.data.workImgList[0]" alt="档案图片">
				<div class="customer_archives_detail-thumbnail" 
					:class="{'full': detailVm.data.thumbnailList && detailVm.data.thumbnailList.length === 9}"
					v-if="detailVm.data.thumbnailList && detailVm.data.thumbnailList.length > 1">
					<div class="customer_archives_detail-thumbnail_item" 
						:class="{'active': index === detailVm.currentIndex}"
						@click="changeCarousel(index)"
						v-for="(item, index) in detailVm.data.thumbnailList" :key="index">
						<img width="50px" height="50px" :src="item">
					</div>
				</div>
			</div>
			<div class="customer_archives_detail-content">
				<div class="customer_archives_detail-user">
					<img :src="detailVm.data.empAvatar" alt="" class="customer_archives_detail-avatar">
					<div class="customer_archives_detail-user_info">
						<h4 class="customer_archives_detail-nickname">{{ detailVm.data.userName }}</h4>
						<div class="customer_archives_detail-assist">
							<span class="customer_archives_detail-role">{{ detailVm.data.levelName }}</span>
							<span class="customer_archives_detail-time">发布于{{ detailVm.data.timeLabel }}</span>
						</div>
					</div>
					
				</div>
				<div class="customer_archives_detail-pricewrap">
					<am-icon name="yinhao" size="13px"></am-icon>
				</div>
				<p class="customer_archives_detail-title-archives">{{ detailVm.data.archives }}</p>
				<div class="customer_archives_detail-actionsl">
					<a class="del" href="javascript:;" @click.stop="delCustomerArchives(detailVm.data)">删除</a>
				</div>
			</div>
		</el-dialog>

		<el-dialog 
			title="添加顾客档案"
			:visible.sync="createWorksVm.dialog"
			width="530px">
			<el-form ref="workForm" :model="worksVm" :rules="formRules"
				size="small" label-position="left" label-width="90px">
				<el-form-item label-width="0" prop="title">
					<div class="textarea_box">
						<el-input v-model="worksVm.title" type="textarea" resize="none" 
							placeholder="记录关于客户的信息，例如发质，喜欢好，个性等"></el-input>
						<div class="create_archives-images">
							<div class="create_archives-image_item_photo" v-for="(item, index) in worksVm.photoList" :key="index">
								<img :src="item" alt="档案图片">
								<span class="create_archives-remove_image_photo" @click="removeUploadImage(index)">
									<am-icon name="Removebutton" size="18px"></am-icon>
								</span>
							</div>
							<div class="create_archives-image_item_photo create_archives-append_button" v-if="worksVm.photoList.length < 9">
								<input @click.stop @change="onSelectWorkImage" type="file" accept="image/*">
								<am-icon name="tianjiatupian" size="18px"></am-icon>
							</div>
						</div>
					</div>
				</el-form-item>
			</el-form>
			<div class="create_archives_action">
				<el-button @click="hideCreateDialog">取消</el-button>
				<el-button type="primary" @click="onSave">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import EmptyTips from '#/components/empty-tips'
import MetaDataMixins from '#/mixins/meta-data'
import UploadImage from '@/components/upload-image'
import {getPicture, imgClass} from '@/utils/imgConfig';
import FindIndex from 'lodash.findindex'
export default {
	name: 'customerArchives',
	mixins: [MetaDataMixins],
	components: {
		EmptyTips,
	},
	data() {
		return {
			createWorksVm: {
				dialog: false,
				loading: true,
			},
			formRules: {
				title: [
					{ required: true, message: '请输入描述内容'},
				],
			},
			detailVm: {
				dialog: false,
				currentIndex: 0,
				data: {
					thumbnailList: []
				}
			},
			worksVm: {
				title: '',
				visible: 0,
				photoList: [],
				itemId: '',
				photoNameList: [],
			},
			loading: true,
			count: 0,
			ListData: [],
			workProductList: [],
			memberData: {}
		}
	},
	computed: {
		uploadImgOption() {
			return {
				parentShopId: this.parentShopId,
				customerId: this.userInfo.userId
			}
		}
	},
	methods: {
		handleCarouselChange(index) {
			this.detailVm.currentIndex = index;
		},
		changeCarousel(index) {
			this.$refs.carousel.setActiveItem(index);
		},
		onCarourselPrev() {
			this.$refs.carousel.prev();
		},
		onCarourselNext() {
			this.$refs.carousel.next();
		},
		viewDetail(data) {
			this.detailVm.dialog = true;
			
			const { photoList } = data;
			
			this.detailVm.data = {
				...data
			};
			
			const imgItemData = {
				parentShopId: this.parentShopId,
				customerId: this.userInfo.userId
			}
			
			this.detailVm.data.thumbnailList = photoList.map(filename => {
				return getPicture('customerFile', {
					filename,
					itemData: imgItemData,
					suffix: 's'
				});
			})
			this.detailVm.data.workImgList = photoList.map(filename => {
				return getPicture('customerFile', {
					filename,
					itemData: imgItemData,
					suffix: 'l'
				});
			})
		},

		handleChangeItemType() {
			this.worksVm.photoList = [];
			this.worksVm.photoNameList = [];
		},

		// 处理服务类回复语言
		changearchives(data) {
			let newdata = "";
			if (data && data.length > 4) {
				if (data.indexOf("生日祝福") > -1 || data.indexOf("节日问候") > -1 || data.indexOf("服务回访") > -1 || data.indexOf("客户关怀") > -1 || data.indexOf("客户关怀") > -1) {
					let tip = `<b style="color: #909090">${data.slice(0, 4)}：</b>`
					let archivestip = data.slice(5, data.length - 1)
					newdata = tip + archivestip
				} else {
					newdata = data
				}
			} else {
				newdata = data
			}
			return newdata
		},

		getData() {
			const { id } = this.$route.params;
			this.loading = true;
			const { shopid } = this.memberData;
			this.$http.post('/memberDetail!archivesList.action', {
				shopId: shopid,
				memberid: id,
				pageNumber: 0,
				pageSize: 100
			}).then(res => {
				this.loading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.ListData = resData.content.map(item => {
						const {
							createTime,
							imgs,
							userId,
							memId,
							userType,
							imgCount,
							empAvatar,
							cover
						} = item;
						const photoList = imgs && imgs.split(',');
						item.timeLabel = this.lastconsumetimeDecorator(createTime, 'YYYY-MM-DD');
						item.imgCount = photoList && photoList.length;
						item.photoList = photoList;
						item.photoList = photoList;
						const imgItemData = {
							parentShopId: this.parentShopId,
							customerId: this.userInfo.userId
						}
						item.cover = photoList && photoList.map(filename => {
							return getPicture('customerFile', {
								filename,
								itemData: imgItemData,
								suffix: 's'
							});
						})
						const avatar = getPicture(userType !== 1 ? 'manager' : 'artisan', {
							itemData: {
								employeeId: userId,
								parentShopId: this.parentShopId
							},
							filename: `${userId}.jpg`,
							suffix: 's'
						})
						item.empAvatar = avatar;
						return item
					})
					this.count = resData.count;
				}
			}).catch(() => {
				this.loading = false;
			});
		},
		openCreateDialog() {
			this.createWorksVm.dialog = true;
			this.worksVm.photoList = [];
			this.worksVm.photoNameList = [];
			this.$nextTick(() => {
				this.$refs.workForm && this.$refs.workForm.resetFields();
			})
			
		},
		hideCreateDialog() {
			this.createWorksVm.dialog = false;
			this.createWorksVm.loading = false;
		},
		async onSelectWorkImage(e) {
			const file = e.target.files[0];
			const imageSrc = await this.$utils.renderFileAsDataURL(file);
			const uploadOption = {
				apiCfg: imgClass.getOptionObj('customerFile', {
					...this.uploadImgOption
				})
			}
			e.target.value = "";
			UploadImage.open({imageSrc, uploadOption}).then(res => {
				this.worksVm.photoNameList.push(res.content);
				this.worksVm.photoList.push(getPicture('customerFile', {
					itemData: this.uploadImgOption,
					filename: res.content,
					suffix: 's'
				}));
			});
		},
		removeUploadImage(index) {
			this.worksVm.photoList.splice(index, 1);
			this.worksVm.photoNameList.splice(index, 1);
		},

		onSave() {
			this.$refs.workForm.validate(valid => {
				if (valid) {
					const { photoNameList } = this.worksVm;
					// if (photoNameList.length === 0) {
					// 	this.$message.warning('请至少上传一张图片');
					// 	return false;
					// }
					const {
						userId,
						userName,
						role,
						name,
					} = this.userInfo;
					
					const { id } = this.$route.params;
					const { shopid } = this.memberData;
					let archives = encodeURIComponent(this.worksVm.title)
					if (this.worksVm.title.length > 200) {
						this.$message.warning('最多可输入200个字符');
						return false;
					} else {
						this.createWorksVm.loading = true;
						const data = {
							archives: archives,
							imgs: photoNameList.join(','),
							memId: id,
							shopId: shopid,
							userId: userId,
							userName: name,
							userType: 0
						}
						this.$http.post('/memberDetail!addCustomerArchives.action', data).then(res => {
							this.hideCreateDialog();
							this.getData();
						})
					}
				}
			})
		},

		delCustomerArchives(data) {
			this.$confirm('此操作将删除该作品, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				return this.$http.post('/memberDetail!delCustomerArchives.action', {id: data.id});
			}).then(res => {
				const resData = res.data;
				const { code } = resData;
				if (code === 0) {
					this.$message.success('删除成功！');
					this.getData();
					this.detailVm.dialog = false
				}
			})
		},

	},
	mounted() {
		this.$parent.root.getMemberDetail().then(content => {
			this.memberData = content.memberInfo;
			this.getData();
		})
	}
}
</script>
<style lang="less">
	.customer_archives {
		padding: 23px 39px 20px 44px;
		.customer_archives-empty {
			margin: 32% 0 0 50%;
			-webkit-transform: translateX(-50%);
			-ms-transform: translateX(-50%);
			transform: translateX(-50%);
		}
		.history_box {
			overflow-y: auto;
			height: calc(100vh - 60px);
			// &::-webkit-scrollbar {
			// 	display: none;
			// }
			li {
				overflow: hidden;
				.box_info {
					position: relative;
					border-bottom:1px solid rgba(240,241,245,1);
					border-radius: 3px;
					float: right;
					width: 100%;
					padding-top: 10px;
					.info {
						width: calc(100% - 216px);
						float: left;
						padding: 0px;
						.info-word {
							padding: 12px 0px 10px;
							color: #333;
							font-size: 13px;
							line-height: 20px;
						}
						.info-operation {
							padding: 0px 0px 15px;
							color: #909090;
							overflow: hidden;
							line-height: 19px;
							img {
								width:24px;
								height:24px;
								border-radius: 50%;
								background: #c0c4cc;
								display: inline-block;
								vertical-align: middle;
								background: url(../../assets/img/openbill-customer.png) no-repeat center center;
								background-size: cover;
							}
							span {
								display: inline-block;
								vertical-align: middle;
								&:nth-of-type(3) {
									margin-left: 11px;
								}
							}
							button {
								float: right;
								margin: 3px 0px 0px 0px;
								padding: 0;
							}
						}
					}
					.imgs {
						float: right;
						padding: 12px 0px 12px;
						width: 183px;
						.info-pic {
							padding: 0px 0px 12px 0px;
							img {
								width: 58px;
								height: 58px;
								margin: 0px 3px 3px 0px;
								float: right;
								cursor: pointer;
							}
							.photo {
								float: left !important;
							}
						}
					}
				}
			}
		}
	}
	.textarea_box {
		padding: 15px 20px;
		min-height: 246px;
		border-radius: 3px;
		border: 1px solid #DCDFE6;
		& .el-textarea__inner {
			border: none;
			padding: 0;
			height: 150px;
			&::placeholder {
				font-size: 12px;
			}
		}
	}
	.create_archives_action {
		text-align: right;
	}
	.customer_archives-header {
		display: flex;
		align-items: center;
	}
	.customer_archives-empty {
		margin: 50px 0 0 50%;
		transform: translateX(-50%);
	}
	.customer_archives-title {
		flex: 1;
		font-size: 13px;
	}
	.customer_archives-create {
		margin-left: 10px;
		font-weight: 700;
		cursor: pointer;
	}
	.customer_archives_list {
		display: flex;
		flex-wrap: wrap;
		min-height: 177px;
	}

	.customer_archives_item-img {
		position: relative;
		height: 141px;
		overflow: hidden;
	}
	.customer_archives_item-content {
		display: flex;
		align-items: center;
		height: calc(100% - 141px);
		font-size: 12px;
		color: #909090;
	}
	.customer_archives_item-avatar {
		width: 24px;
		height: 24px;
		margin: 0 5px;
		border-radius: 100%;
		i {
			margin: 4px;
		}
	}
	.picavatar {
		float: left;
		margin: 0px 5px 0px 0px !important;
		align-items: center;
		width: 24px;
		height: 24px;
		margin: 0 5px;
		border-radius: 100%;
		overflow: hidden;
		background: #ddd;
		justify-content: center;
		color: #fff;
	}
	.customer_archives_item-actions,
	.customer_archives_item-icon {
		position: absolute;
		top: 3px;
		right: 0;
		display: inline-flex;
		font-size: 12px;
		color: #fff;
	}
	.customer_archives_item-actions {
		display: none;
	}
	.customer_archives_item-actions .action_item,
	.customer_archives_item-img_num {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 5px;
		padding: 2px 5px;
		background:rgba(0,0,0,.3);
		border-radius: 10px;
		cursor: pointer;
	}
	.customer_archives_item-img_num i { 
		margin-right: 3px;
	}
	.create_archives-images {
		display: flex;
		flex-wrap: wrap;
		margin-top: -10px;
	}
	.create_archives-remove_image_photo {
		position: absolute;
		top: 0;
		right: 0;
		width: 14px;
		line-height: 14px;
		color: #fff;
		cursor: pointer;
		transform: translate(50%, -50%);
		border-radius: 100%;
		text-align: center;
		i {
			color: #DA3D4D;
		}
	}
	.create_archives-image_item_photo {
		position: relative;
		width: 54px;
		height: 54px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(249, 249, 249);
		margin-top: 20px;
		margin-right: 20px;
		& ~ .create_archives-image_item_photo {
			margin-right: 20px !important;
		}
		& img {
			width: 100%;
		}
		& input {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			opacity: 0;
			z-index: 1;
			cursor: pointer;
		}
	}
	.create_archives-append_button {
		overflow: hidden;
		margin-left: 0px !important;
	}
	.customer_archives_detail .el-dialog {
		margin: 0 auto;
	}
	.customer_archives_detail {
		& .el-dialog__body {
			padding: 0;
			display: flex;
			min-height: 700px;
			height: 100vh;
			align-items: center;
			background: #fafafa;
		}
		& .el-dialog__header {
			height: 0;
			padding: 0;
		}
		& .el-dialog__headerbtn {
			font-size: 24px;
			top: 10px;
			right: 10px;
		}
	}
	.customer_archives_detail_close {
		position: absolute;
		top: 10px;
    	right: 10px;
		color: #909399;
		cursor: pointer;
		&:hover i {
			color: #409eff;
		}
	}
	.customer_archives_detail-carousel {
		position: relative;
		margin: 0 auto;
		width: 500px;
	}
	.customer_archives_detail-carousel_prev,
	.customer_archives_detail-carousel_next {
		position: absolute;
		top: 250px;
		width: 44px;
		height: 44px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #D2D2D2;
		cursor: pointer;
		opacity: .5;
		transition: opacity .3s;
		&:hover {
			opacity: 1;
			color: #555;
		}
	}
	.customer_archives_detail-carousel_prev {
		left: -43px;
		transform: translate(-100%, -50%);
	}
	.customer_archives_detail-carousel_next {
		right: -43px;
		transform: translate(100%, -50%);
	}
	.customer_archives_detail-thumbnail {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 13px;
		&:not(.full) {
			margin-left: -3px;
			margin-right: -3px;
			& .customer_archives_detail-thumbnail_item {
				margin: 0 3px;
			}
		}
		&.full {
			justify-content: space-between
		}
	}
	.customer_archives_detail-thumbnail_item {
		flex: 0 0 50px;
		display: inline-flex;
		cursor: pointer;
		&.active {
			border: 2px solid #409EFF;
		}
	}
	.customer_archives_detail-content {
		box-sizing: border-box;
		height: 100%;
		padding: 45px 34px 20px;
		width: 380px;
		background: #F5F5F5;
	}
	.customer_archives_detail-user {
		display: flex;
	}
	.customer_archives_detail-avatar {
		flex: 0 0 73px;
		height: 73px;
		border-radius: 100%;
	}
	.customer_archives_detail-user_info {
		margin-left: 17px;
		padding-top: 12px;
	}
	.customer_archives_detail-nickname {
		font-size: 14px;
	}
	.customer_archives_detail-assist {
		display: flex;
		margin-top: 5px;
		color: #909090;
		font-size: 12px;
	}
	.customer_archives_detail-role {
		margin-right: 10px;
	}
	.customer_archives_detail-pricewrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 26px;
		color: #DDD;
	}
	.customer_archives_detail-pricetag {
		padding: 2px 9px;
		color: #fff;
		font-size: 12px;
		border-radius: 11px;
		background: rgb(209, 209, 209)
	}
	.customer_archives_detail-title-archives {
		margin-top: 15px;
		color: #333;
		font-size: 15px;
		line-height: 1.8 !important;
	}
	.customer_archives_detail-actionsl {
		display: flex;
		align-items: center;
		margin-top: 23px;
		color: #909090;
		font-size: 12px;
		padding-bottom: 20px;
		border-bottom: none !important;
		.del {
			margin-left: 0px;
		}
	}
</style>
