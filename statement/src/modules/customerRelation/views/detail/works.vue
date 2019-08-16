<template>
	<div class="customer_works">
		<div class="customer_works-header">
			<h3 class="customer_works-title">作品</h3>
			<span class="customer_works-total">共有{{ count }}条作品</span>
			<a class="customer_works-create" @click="openCreateDialog">
				<am-icon name="plus" is-element></am-icon>
			</a>
		</div>
		<empty-tips class="customer_works-empty" v-if="!loading && (!listData || listData.length === 0)"></empty-tips>
		<div class="customer_works_list" v-loading="loading">
			<div class="customer_works_item" @click="viewDetail(item)" v-for="item in listData" :key="item.id">
				<div class="customer_works_item-img">
					<el-image style="width: 141px;height: 141px;" fit="cover" :src="item.cover"></el-image>
					<div class="customer_works_item-actions">
						<span class="customer_works_item-cancel_approve action_item" @click.stop="onApproveWork(item)">
							<template v-if="item.visible === 1">取消审核</template>
							<template v-else>审核</template>
						</span>
						<span class="customer_works_item-delete action_item" @click.stop="onDeleteWork(item)">
							<am-icon name="shanchu3"></am-icon>
						</span>
					</div>
					<div class="customer_works_item-icon">
						<span class="customer_works_item-img_num" v-if="item.imgCount > 1">
							<am-icon name="tupian"></am-icon> {{ item.imgCount }}
						</span>
					</div>
				</div>
				<div class="customer_works_item-content">
					<el-image class="customer_works_item-avatar" :src="item.empAvatar">
						<am-icon slot="error" name="s-custom" is-element size="16px"></am-icon>
					</el-image>
					<span class="customer_works_item-time">发布于{{ item.timeLabel }}</span>
				</div>
			</div>
		</div>
		<el-dialog
			class="customer_work_detail"
			:visible.sync="detailVm.dialog"
			width="1189px"
			top="0">
			<div class="customer_work_detail_close" @click="detailVm.dialog = false">
				<am-icon size="34px" name="fanhui"></am-icon>
			</div>
			<div class="customer_work_detail-carousel" v-if="detailVm.dialog">
				<template v-if="detailVm.data.thumbnailList.length > 1">
					<span class="customer_work_detail-carousel_prev" title="上一张" @click="onCarourselPrev">
						<am-icon name="xiangzuo1" size="43px"></am-icon>
					</span>
					<span class="customer_work_detail-carousel_next" title="下一张" @click="onCarourselNext">
						<am-icon name="xiangyou" size="43px"></am-icon>
					</span>
					<el-carousel :interval="5000" height="500px" ref="carousel"
						arrow="never" indicator-position="none"
						@change="handleCarouselChange">
						<el-carousel-item v-for="item in detailVm.data.workImgList" :key="item">
							<el-image :src="item" fit="cover" style="width: 500px;height: 500px"></el-image>
						</el-carousel-item>
					</el-carousel>
				</template>
				<el-image style="width: 500px;height: 500px;" fit="cover" v-else-if="detailVm.data.thumbnailList.length" :src="detailVm.data.workImgList[0]"></el-image>
				<div class="customer_work_detail-thumbnail" 
					:class="{'full': detailVm.data.thumbnailList.length === 9}"
					v-if="detailVm.data.thumbnailList.length > 1">
					<div class="customer_work_detail-thumbnail_item" 
						:class="{'active': index === detailVm.currentIndex}"
						@click="changeCarousel(index)"
						v-for="(item, index) in detailVm.data.thumbnailList" :key="index">
						<el-image :src="item" fit="cover" style="width: 50px;height: 50px"></el-image>
					</div>
				</div>
			</div>
			<div class="customer_work_detail-content">
				<div class="customer_work_detail-user">
					<el-image :src="detailVm.data.empAvatar" class="customer_work_detail-avatar">
						<am-icon slot="error" name="s-custom" is-element size="50px"></am-icon>
					</el-image>
					<div class="customer_work_detail-user_info">
						<h4 class="customer_work_detail-nickname">{{ detailVm.data.empName }}</h4>
						<div class="customer_work_detail-assist">
							<span class="customer_work_detail-role">{{ detailVm.data.empLevelName }}</span>
							<span class="customer_work_detail-time">发布于{{ detailVm.data.timeLabel }}</span>
						</div>
					</div>
				</div>
				<div class="customer_work_detail-pricewrap">
					<am-icon name="yinhao" size="13px"></am-icon>
					<span class="customer_work_detail-pricetag" v-if="detailVm.data.price">
						门店价￥{{ detailVm.data.price }}
					</span>
				</div>
				<p class="customer_work_detail-title">{{ detailVm.data.title }}</p>
				<div class="customer_work_detail-actions">
					<span class="customer_work_detail-like">
						<am-icon name="dianzan"></am-icon>
						有{{ detailVm.data.likes }}人点赞了作品
					</span>
					<a class="customer_work_detail-approve" href="javascript:;" @click.stop="onApproveWork(detailVm.data)">
						<template v-if="detailVm.data.visible === 1">取消审核</template>
						<template v-else>审核</template>
					</a>
					<a class="customer_work_detail-delete" href="javascript:;" @click.stop="onDeleteWork(detailVm.data)">删除</a>
				</div>
				<div class="customer_work_detail-commentlist">
					<empty-tips class="customer_works-empty" icon-name="wu" v-if="!detailVm.data.inventionEvaluations || detailVm.data.inventionEvaluations.length === 0">
						<span slot="text">暂无任何评论~</span>
					</empty-tips>
					<p v-else class="customer_work_detail-commenttitle">有{{ detailVm.data.inventionEvaluations.length }}人发表了评论</p>
					<div class="customer_work_detail-commentitem" 
						v-for="commentItem in detailVm.data.inventionEvaluations"
						:key="commentItem.id">
						<el-image :src="commentItem.memAvatar" class="commentitem_avatar"></el-image>
						<p class="commentitem_content">
							<span class="commentitem_nickname">{{ commentItem.memName }}：</span>
							{{ commentItem.content }}
						</p>
					</div>
				</div>
			</div>
		</el-dialog>

		<el-dialog 
			title="添加作品"
			:visible.sync="createWorksVm.dialog"
			width="513px">
			<el-form class="create_work_form" ref="workForm" :model="worksVm" :rules="formRules"
				size="small" label-position="left" label-width="90px">
				<el-form-item label="选择分类" prop="subType">
					<el-select style="width: 100%;" placeholder="选择分类" filterable @change="handleChangeItemType" v-model="worksVm.subType">
						<el-option 
							v-for="item in workCategoryList"
							:key="item.subCategory"
							:label="item.subCategoryName"
							:value="item.subCategory"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="关联商品：" prop="itemId">
					<el-select style="width: 100%;" placeholder="选择商品" filterable v-model="worksVm.itemId" @change='handleItemChange'>
						<el-option v-for="item in workProductList" :key="item.id" :label="item.name" :value="item.id">
							<span style="float: left" :title="item.name">{{ item.name | cutString(28) }}</span>
      						<span style="float: right;">￥{{ item.price }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-row>
					<el-col :span="14">
						<el-form-item label="门店原价：" prop="price">
							<el-input-number :disabled="!!worksVm.itemId" size="mini" :max="99999999" v-model="worksVm.price" :min="0" :controls="false"></el-input-number>
							<span>元</span>
						</el-form-item>
					</el-col>
					<el-col :span="8" :offset="2">
							<el-form-item label="显示在美一客：" label-width="110px" prop="visible">
								<el-switch :active-value="1" :inactive-value="0" v-model="worksVm.visible"></el-switch>
							</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label-width="0" prop="title">
					<div class="textarea_box">
						<el-input v-model="worksVm.title" maxlength="200" type="textarea" resize="none" 
							placeholder="这里建议填写烫染配方或者造型技术细节…"></el-input>
						<div class="create_work-images">
							<div class="create_work-image_item" v-for="(item, index) in worksVm.photoList" :key="index">
								<img :src="item" alt="作品图片">
								<span class="create_work-remove_image" @click="removeUploadImage(index)">
									<am-icon name="guanbi" size="12px"></am-icon>
								</span>
							</div>
							<div class="create_work-image_item create_work-append_button" v-if="worksVm.photoList.length < 9" @click="handleDisabledSelectFile">
								<input @click.stop @change="onSelectWorkImage" type="file" accept="image/*" v-if="worksVm.subType">
								<am-icon name="tianjiatupian" size="18px"></am-icon>
							</div>
						</div>
					</div>
				</el-form-item>
			</el-form>
			<div class="create_work_action">
				<el-button @click="hideCreateDialog">取消</el-button>
				<el-button type="primary" @click="onSave" :loading="createWorksVm.loading">确定</el-button>
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
const workCategoryDefaultConfig = [
	{
		category: 1,
		subCategory: 101,
		subCategoryName: "优雅长发"
	},
	{
		category: 1,
		subCategory: 102,
		subCategoryName: "慵懒中发"
	},
	{
		category: 1,
		subCategory: 103,
		subCategoryName: "灵气短发"
	},
	{
		category: 1,
		subCategory: 104,
		subCategoryName: "男发"
	},
	// 美妆
	{
		category: 2,
		subCategory: 201,
		subCategoryName: "生活妆"
	},
	{
		category: 2,
		subCategory: 202,
		subCategoryName: "新娘妆"
	},
	{
		category: 2,
		subCategory: 203,
		subCategoryName: "晚宴妆"
	},
	// 美容美体
	{
		category: 3,
		subCategory: 301,
		subCategoryName: "美容"
	},
	{
		category: 3,
		subCategory: 302,
		subCategoryName: "美白"
	},
	{
		category: 3,
		subCategory: 303,
		subCategoryName: "补水"
	},
	{
		category: 3,
		subCategory: 304,
		subCategoryName: "眼部"
	},
	{
		category: 3,
		subCategory: 305,
		subCategoryName: "美体"
	},
	{
		category: 3,
		subCategory: 306,
		subCategoryName: "脱毛"
	},
	// 美甲美睫
	{
		category: 4,
		subCategory: 401,
		subCategoryName: "简约美甲"
	},
	{
		category: 4,
		subCategory: 402,
		subCategoryName: "钻石美甲"
	},
	{
		category: 4,
		subCategory: 403,
		subCategoryName: "几何美甲"
	},
	{
		category: 4,
		subCategory: 404,
		subCategoryName: "彩绘美甲"
	},
	{
		category: 4,
		subCategory: 405,
		subCategoryName: "法式美甲"
	},
	{
		category: 4,
		subCategory: 406,
		subCategoryName: "美睫"
	},
	// 美甲美睫
	{
		category: 5,
		subCategory: 501,
		subCategoryName: "手部护理"
	},
	{
		category: 5,
		subCategory: 502,
		subCategoryName: "足部护理"
	},
	// 其它
	{
		category: 6,
		subCategory: 601,
		subCategoryName: "其它"
	}
]
export default {
	name: 'customerWorks',
	mixins: [MetaDataMixins],
	components: {
		EmptyTips
	},
	data() {
		return {
			createWorksVm: {
				dialog: false,
				loading: false,
			},
			formRules: {
				title: [
					{ required: true, message: '请输入描述内容'},
				],
				subType: [
					{ required: true, message: '请选择作品分类'},
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
				price: '',
				subType: '',
				photoNameList: [],
			},
			loading: true,
			count: undefined,
			listData: [],
			workProductList: [],
			memberData: {},
			filterData: {
				pageNumber: 0,
				pageSize: 100
			}
		}
	},
	computed: {
		pageNumber() {
			return this.filterData.pageNumber + 1;
		},
		configsMaps() {
			const configArr = this.$eventBus.env.configs;
			let configsMaps = {};
			if (!configArr) return configsMaps;
			configArr.forEach(item => {
				const {
					configKey,
					configValue
				} = item;
				configsMaps[configKey] = configValue;
			})
			return configsMaps;
		},
		workCategoryList() {
			let result = [];
			for (let categoryNum = 1; categoryNum < 7; categoryNum++) {
				const currentConfigValue = this.configsMaps[`category_${categoryNum}`];
				if (currentConfigValue === 'true') {
					const textMaxLength = categoryNum === 2 ? 4 : 10;
					for (let textNum = 1; textNum < textMaxLength; textNum++) {
						const subCategoryName = this.configsMaps[`category_${categoryNum}_text${textNum}`];
						if (subCategoryName) {
							result.push({
								category: categoryNum,
								subCategory: `${categoryNum}0${textNum}`,
								subCategoryName
							})
						}
					}
				}
			}
			return result;
		},
		currentSelectProductData() {
			const {
				itemId
			} = this.worksVm;
			if (itemId) {
				const index = FindIndex(this.workProductList, item => item.id === itemId);
				const itemData = this.workProductList[index];
				return itemData;
			}
			return {};
		},
		uploadImgOption() {
			const typeItem = this.findCategory(this.worksVm.subType);
			if (!typeItem) {
				return;
			}
			return {
				catigoryId: typeItem.category,
				parentShopId: this.parentShopId,
				authorId: this.userInfo.userId
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
			const { photoList, type, inventionEvaluations, empId } = data;
			this.detailVm.data = {
				...data
			};
			const imgItemData = {
				catigoryId: type,
				parentShopId: this.parentShopId,
				authorId: empId
			}
			this.detailVm.data.inventionEvaluations.forEach(item => {
				const { memId } = item;
				const avatarUrl = getPicture('customer', {
					filename: `${memId}.jpg`,
					itemData: {
						parentShopId: this.parentShopId,
					},
					suffix: 's'
				})
				item.memAvatar = avatarUrl;
			})
			this.detailVm.data.thumbnailList = photoList.map(filename => {
				return getPicture('show', {
					filename,
					itemData: imgItemData,
					suffix: 's'
				});
			})
			this.detailVm.data.workImgList = photoList.map(filename => {
				return getPicture('show', {
					filename,
					itemData: imgItemData,
					suffix: 'l'
				});
			})
		},
		findCategory(subId) {
			const typeItemIndex = FindIndex(this.workCategoryList, item => item.subCategory === subId);
			const typeItem = this.workCategoryList[typeItemIndex];
			return typeItem;
		},
		handleChangeItemType() {
			this.worksVm.photoList = [];
			this.worksVm.photoNameList = [];
		},
		handleItemChange(id) {
			this.worksVm.price = this.currentSelectProductData.price;
		},
		getData() {
			const { id } = this.$route.params;
			this.loading = true;
			const { shopid } = this.memberData;
			this.$http.post('/memberDetail!inventionList.action', {
				shopId: shopid,
				memberid: id,
				...this.filterData,
			}).then(res => {
				this.loading = false;
				const resData = res.data;
				const { code, content, count } = resData;
				if (code === 0) {
					content.forEach(item => {
						const {
							createTime,
							photo,
							type,
							empId,
							empType
						} = item;
						const photoList = photo.split(',');
						item.timeLabel = this.lastconsumetimeDecorator(createTime, 'YYYY.MM.DD');
						item.imgCount = photoList.length;
						item.photoList = photoList;
						item.cover = getPicture('show', {
							itemData: {
								catigoryId: type,
								parentShopId: this.parentShopId,
								authorId: empId
							},
							filename: photoList[0],
							suffix: 's'
						});
						const avatar = getPicture(empType !== 1 ? 'manager' : 'artisan', {
							itemData: {
								employeeId: empId,
								parentShopId: this.parentShopId
							},
							filename: `${empId}.jpg`,
							suffix: 's'
						})
						item.empAvatar = avatar;
					})
					this.listData = content;
					this.count = count;
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
			if (!this.worksVm.subType) {
				this.handleDisabledSelectFile();
				return;
			}
			const uploadOption = {
				apiCfg: imgClass.getOptionObj('show', {
					...this.uploadImgOption
				})
			}
			e.target.value = "";
			UploadImage.open({imageSrc, uploadOption}).then(res => {
				this.worksVm.photoNameList.push(res.content);
				this.worksVm.photoList.push(getPicture('show', {
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
		getWorkProductList() {
			this.$http.post('/memberDetail!queryMallItem.action', {
				category: 1,
				parentShopId: this.parentShopId
			}).then(res => {
				const resData = res.data;
				const {
					code,
					content
				} = resData;
				if (code === 0) {
					this.workProductList = content;
				}
			})
		},
		handleDisabledSelectFile() {
			this.$message.info('请先选择作品分类');
		},
		onSave() {
			this.$refs.workForm.validate(valid => {
				if (valid) {
					const { photoNameList } = this.worksVm;
					if (photoNameList.length === 0) {
						this.$message.warning('请至少上传一张图片');
						return false;
					}
					const {
						userId,
						userName,
						role,
						name,
					} = this.userInfo;
					const categoryData = this.findCategory(this.worksVm.subType);
					const {
						category: itemType,
						name: itemName,
					} = this.currentSelectProductData;
					
					const { id } = this.$route.params;
					const { shopid, name: memName } = this.memberData;
					this.createWorksVm.loading = true;
					this.$http.post('/memberDetail!addInvention.action', {
						...this.worksVm,
						photo: photoNameList.join(','),
						operatorId: userId,
						empId: userId,
						empName: name,
						empType: 0,
						empLevelName: {'1': '操作员', '2': '管理员'}[role] || '老板',
						type: categoryData.category,
						itemType,
						itemName,
						photoList: undefined,
						photoNameList: undefined,
						memId: id,
						shopId: shopid,
						parentShopId: this.parentShopId,
						memName
					}).then(res => {
						this.hideCreateDialog();
						this.getData();
					})
				}
			})
		},
		onApproveWork(data) {
			const { id } = data;
			const visible = data.visible === 1 ? 0 : 1
			this.$http.post('/memberDetail!audit.action', {
				id,
				visible
			}).then(res => {
				const resData = res.data;
				const { code } = resData;
				if (code === 0) {
					data.visible = visible;
					this.getData();
					this.$message.success("修改成功")
				}
			})
		},
		onDeleteWork(data) {
			this.$confirm('此操作将删除该作品, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				return this.$http.post('/memberDetail!delInvention.action', {id: data.id});
			}).then(res => {
				const resData = res.data;
				const { code } = resData;
				if (code === 0) {
					this.$message.success('删除成功！');
					this.getData();
					this.detailVm.dialog = false;
				}
			})
		},
	},
	mounted() {
		this.$parent.root.getMemberDetail().then(content => {
			this.memberData = content.memberInfo;
			this.getData();
		})
		this.getWorkProductList();
	}
}
</script>
<style>
	.customer_works {
		padding: 23px 39px 20px;
		height: 100%;
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
	.create_work_action {
		text-align: right;
	}
	.customer_works-header {
		display: flex;
		align-items: center;
	}
	.customer_works-empty {
		margin: 50px 0 0 50%;
		transform: translateX(-50%);
	}
	.customer_works-title {
		flex: 1;
	}
	.customer_works-create {
		margin-left: 10px;
		font-weight: 700;
		cursor: pointer;
	}
	.customer_works_list {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		min-height: 177px;
		max-height: calc(100% - 30px);
		overflow-y: auto;
		margin: 0 -10px;
		padding-bottom:  20px;
		&::-webkit-scrollbar {
			display: none;
		}
	}
	.customer_works_item {
		flex: 0 0 141px;
		width: 141px;
		height: 177px;
		overflow: hidden;
		margin: 20px 8px 0;
		box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.11);
		transition: all .3s;
		cursor: pointer;
		&:hover {
			box-shadow:  0px 1px 15px 0px rgba(0,0,0,0.22);
			& .customer_works_item-actions {
				display: inline-flex;
			}
			& .customer_works_item-icon {
				display: none;
			}
		}
	}
	.customer_works_item-img {
		position: relative;
		height: 141px;
		overflow: hidden;
	}
	.customer_works_item-content {
		display: flex;
		align-items: center;
		height: calc(100% - 141px);
		font-size: 12px;
		color: #909090;
	}
	.customer_works_item-avatar.el-image {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 24px;
		height: 24px;
		margin: 0 5px;
		border-radius: 100%;
		overflow: hidden;
		background: #ddd;
		color: #fff;
	}
	.customer_works_item-actions,
	.customer_works_item-icon {
		position: absolute;
		top: 3px;
		right: 0;
		display: inline-flex;
		font-size: 12px;
		color: #fff;
	}
	.customer_works_item-actions {
		display: none;
	}
	.customer_works_item-actions .action_item,
	.customer_works_item-img_num {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 5px;
		padding: 2px 5px;
		background:rgba(0,0,0,.3);
		border-radius: 10px;
		cursor: pointer;
		&:hover {
			background: rgba(0,0,0,.5);
			transition: all .3s;
		}
	}
	.customer_works_item-img_num i { 
		margin-right: 3px;
	}
	.create_work-images {
		display: flex;
		flex-wrap: wrap;
		margin-top: -10px;
	}
	.create_work-remove_image {
		position: absolute;
		top: 0;
		right: 0;
		width: 14px;
		line-height: 14px;
		color: #fff;
		cursor: pointer;
		transform: translate(50%, -50%);
		background: #DA3D4D;
		border-radius: 100%;
		text-align: center;
	}
	.create_work-image_item {
		position: relative;
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(249, 249, 249);
		margin-top: 10px;
		& ~ .create_work-image_item {
			margin-left: 18px;
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
	.create_work-append_button {
		overflow: hidden;
	}
	.create_work_form {
		& .el-form-item__label {
			display: flex;
			flex-direction: row-reverse;
			justify-content: flex-end;
			&::before {
				margin-left: 2px;
			}
		}
	}
	.customer_work_detail {
		& .el-dialog {
			margin: 0 auto;
		}
		& .el-dialog__body {
			position: relative;
			display: flex;
			padding: 0;
			min-height: 715px;
			height: 100vh;
			align-items: center;
			background: #fafafa;
		}
		& .el-dialog__header {
			height: 0;
			padding: 0;
		}
		& .el-dialog__headerbtn {
			display: none;
		}
	}
	.customer_work_detail_close {
		position: absolute;
		top: 10px;
    	right: 10px;
		color: #909399;
		cursor: pointer;
		transition: color .3s;
		&:hover {
			color: #409eff;
			transition: color .3s;
		}
	}
	.customer_work_detail-carousel {
		min-height: 500px;
		position: relative;
		flex: 0 0 500px;
		margin: 0 auto;
	}
	.customer_work_detail-carousel_prev,
	.customer_work_detail-carousel_next {
		position: absolute;
		top: calc(50% - 54px);
		width: 44px;
		height: 44px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #D2D2D2;
		cursor: pointer;
		opacity: 1;
		transition: all .3s;
		&:hover {
			color: #555;
		}
	}
	.customer_work_detail-carousel_prev {
		left: -43px;
		transform: translate(-100%, -50%);
	}
	.customer_work_detail-carousel_next {
		right: -43px;
		transform: translate(100%, -50%);
	}
	.customer_work_detail-thumbnail {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 13px;
		&:not(.full) {
			margin-left: -3px;
			margin-right: -3px;
			& .customer_work_detail-thumbnail_item {
				margin: 0 3px;
			}
		}
		&.full {
			justify-content: space-between
		}
	}
	.customer_work_detail-thumbnail_item {
		flex: 0 0 50px;
		display: inline-flex;
		cursor: pointer;
		&.active {
			border: 2px solid #409EFF;
		}
	}
	.customer_work_detail-content {
		box-sizing: border-box;
		height: 100%;
		padding: 45px 34px 20px;
		width: 380px;
		background: #F5F5F5;
	}
	.customer_work_detail-user {
		display: flex;
	}
	.customer_work_detail-avatar.el-image {
		flex: 0 0 73px;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 73px;
		border-radius: 100%;
		overflow: hidden;
		background: #ddd;
		color: #fff;
	}
	.customer_work_detail-user_info {
		margin-left: 17px;
		padding-top: 12px;
	}
	.customer_work_detail-nickname {
		font-size: 14px;
	}
	.customer_work_detail-assist {
		display: flex;
		margin-top: 5px;
		color: #909090;
		font-size: 12px;
	}
	.customer_work_detail-role {
		margin-right: 10px;
	}
	.customer_work_detail-pricewrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 26px;
		color: #DDD;
	}
	.customer_work_detail-pricetag {
		padding: 2px 9px;
		color: #fff;
		font-size: 12px;
		border-radius: 11px;
		background: rgb(209, 209, 209)
	}
	.customer_work_detail-title {
		margin-top: 7px;
		color: #333;
		font-size: 15px;
		line-height: 1.4;
	}
	.customer_work_detail-actions {
		display: flex;
		align-items: center;
		margin-top: 23px;
		color: #909090;
		font-size: 12px;
		padding-bottom: 20px;
		border-bottom: 1px solid #D9D9D9;
	}
	.customer_work_detail-like {
		flex: 1;
	}
	.customer_work_detail-delete {
		margin-left: 13px;
	}
	.customer_work_detail-commentlist {
		padding-top: 20px;
		max-height: calc(100% - 220px);
		overflow-y: auto;
	}
	.customer_work_detail-commenttitle {
		font-size: 12px;
		color: #909090;
	}
	.customer_work_detail-commentitem {
		display: flex;
		padding: 16px 0;
		border-bottom: 1px solid #D9D9D9;
		& .commentitem_avatar {
			width: 27px;
			height: 27px;
			border-radius: 100%;
		}
		& .commentitem_content {
			flex: 1;
			line-height: 1.4;
			margin-left: 14px;
			font-size: 12px;
			color: #333;
		}
		& .commentitem_nickname {
			color: #909090;
			font-weight: 700;
		}

	}
</style>
