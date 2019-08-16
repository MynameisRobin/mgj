<template>
	<div class="customer_profile_basics" v-loading="loading">
		<div class="basicdata">
			<div class="basetitle"><span>基本资料</span></div>
			<ul class="basebox">
				<li>
					<b>姓名 ：</b> <span>{{memberData.name ? memberData.name : '--'}}<am-icon size="16px" name="Group1" class="sexl" v-if="memberData.sex == 'M'"></am-icon><am-icon size="16px" name="Group3" class="sexn" v-if="memberData.sex == 'F'"></am-icon></span>
					<span @click="show()" class="pointer"><am-icon size="12px" name="fanganbianji" class="modfiy" ></am-icon></span>
				</li>
				<li>
					<b>昵称 ：</b> <span>{{memberData.mgjnickname ? memberData.mgjnickname : '--'}}</span>
				</li>
				<li>
					<b>手机号 ：</b> <span>{{mobile ? mobile : '--'}}</span>
				</li>
				<li>
					<b>生日 ：</b> <span>{{memberData.birthday ? memberData.birthday : '--'}}</span>
				</li>
				<li>
					<b>来源 ：</b> <span>{{source}}</span>
				</li>
				<li>
					<b>介绍人 ：</b> <span v-if="memberData.mgjsourceid == 3">{{memberData.introducername ? memberData.introducername : '--'}}</span><span v-else>--</span>
				</li>
				<li>
					<b>备注 ：</b> <span class="repage">{{memberData.page ? memberData.page : '--'}}</span>
				</li>

				<div class="photolock" v-if="memberData.locking == 2" @click="openlock">
					<am-icon slot="reference" size="20px" name="suo"></am-icon>
					<i>点击解锁</i>
				</div>
				<input @click.stop @change="onSelectWorkImage" type="file" accept="image/*" class="customerPic" @mouseover="hoverIn" @mouseout="hoverOut">
					<i :class="memberData.mgjIsHighQualityCust == 1 ? 'img HighQuality' : 'img noHighQuality'" v-if="picloadshow">
						<b class="huguan" v-if="memberData.mgjIsHighQualityCust == 1"></b>
						<img v-if="avaterUrl" :src="avaterUrl" alt="">
					</i>
				</input>
				<i class="guan icon iconfont fanganbianji" style="font-size: 9px;">
					<am-icon slot="reference" size="9px" name="fanganbianji" class="guan hoverIcon"></am-icon>
				</i>
			</ul>
		</div>
		<div class="update_popper_dom" ref="updatePopperDom" style="position: absolute;left: -9999px; top: -9999px;z-index: 9">
			<el-date-picker
				v-if="updatePopperVm.params.type === 'datepicker'"
				v-bind="updatePopperVm.params.attrs"
				v-model="updatePopperVm.value"
				type="date"
				value-format="yyyy-MM-dd"
				start-placeholder="有效日期">
			</el-date-picker>
			<el-input v-bind="updatePopperVm.params.attrs" v-else-if="updatePopperVm.params.type === 'textarea'" 
			type="textarea" v-model="updatePopperVm.value" rows="4" style="width: 350px"></el-input>
			<el-input v-bind="updatePopperVm.params.attrs" v-else v-model="updatePopperVm.value"></el-input>
			<div class="action_wrap">
				<el-button size="mini" @click="destroyPopper">取消</el-button>
				<el-button type="primary" size="mini" @click="updateCardDataForPopper">确定</el-button>
			</div>
		</div>
		<div class="membercard">
			<div class="basetitle"><span>会员卡</span></div>
			<div class="cardbox" v-for="(subdata, index) in newcards" :key="index">
				<p class="nowarp shoptitle"><b><am-icon size="12px" name="Group2" class="shopname"></am-icon></b>{{index}}</p>
				<el-card class="box-card card_d" v-for="(item, index) in subdata" :key="index" v-if="cards.length > 0">
					<div class="box">
						<div class="box_top" v-if="allQuan">
							<el-dropdown placement="bottom" class="opareMore" popper-class="opareMore" trigger="hover">
							<span class="el-dropdown-link">
								<am-icon size="16px" name="bianji2" class="gary more"></am-icon>
							</span>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item v-for="(itemsub, index) in operationList" :key="index" @click.native="operation(item, index)" v-if="item.timeflag != '1' && item.cardtype != '2' && $eventBus.env.userInfo.operateStr.indexOf('K') > -1">
									<am-icon size="15px" :name="itemsub.icon" class="moreOpera"></am-icon>  {{ itemsub.name }}
								</el-dropdown-item>
								<el-dropdown-item @click.native="operation(item, 2)" v-if="$eventBus.env.userInfo.operateStr.indexOf('E') > -1"><am-icon size="15px" name="zhuxiao" class="moreOpera"></am-icon> 注销 </el-dropdown-item>
								<el-dropdown-item @click.native="operation(item, 3)" v-if="!memberData.passwd"><am-icon size="15px" name="shezhimima" class="moreOpera"></am-icon> 设置密码 </el-dropdown-item>
								<el-dropdown-item @click.native="operation(item, 3)" v-if="memberData.passwd && $eventBus.env.userInfo.operateStr.indexOf('X1') != -1"><am-icon size="15px" name="shezhimima" class="moreOpera"></am-icon> 修改密码 </el-dropdown-item>
								<el-dropdown-item @click.native="operation(item, 4)" v-if="memberData.passwd && $eventBus.env.userInfo.operateStr.indexOf('X2') != -1"><am-icon size="15px" name="shezhimima" class="moreOpera"></am-icon> 取消密码 </el-dropdown-item>
							</el-dropdown-menu>
							</el-dropdown>
						</div>
						<div class="box-tip">
							<p class="cardnametitle">{{item.cardtypename}}</p>
							<div class="box_right">
								<div class="box_right_info">
									<span class="list yue zhekou">折扣：
										<el-tooltip v-if="hasEditCardInfo" class="item" effect="dark" content="修改折扣" placement="top">
											<b class="bold is_edit"
											@click="showUpdateCardPopper({key: 'discount', data: item,}, $event)">{{item.discount == 0 ? "无" : item.discount + "折"}}</b>
										</el-tooltip>
										<b v-else class="bold">{{item.discount == 0 ? "无" : item.discount + "折"}}</b>
									</span>
									<span class="list yue">余额：
										<el-tooltip v-if="hasEditCardFee && item.cardtype === '1' && ['1', '2', '3'].indexOf(item.timeflag) === -1"
											class="item" effect="dark" content="修改余额" placement="top">
											<b class="cardfeebg is_edit" @click="showUpdateCardPopper({key: 'cardfee', data: item,}, $event)">￥{{item.cardfee ? item.cardfee : 0}}</b>
										</el-tooltip>
										<b v-else class="cardfeebg">￥{{item.cardfee ? item.cardfee : 0}}</b>
									</span>
									<span class="list">赠金：
										<el-tooltip v-if="hasEditCardFee && item.cardtype === '1' && ['1', '2', '3'].indexOf(item.timeflag) === -1"
													class="item" effect="dark" content="修改赠金" placement="top">
											<b class="bold is_edit" @click="showUpdateCardPopper({key: 'presentfee', data: item,}, $event)">￥{{item.presentfee ? item.presentfee : 0}}</b>
										</el-tooltip>
										<b v-else class="bold">￥{{item.presentfee ? item.presentfee : 0}}</b>
									</span>
								</div>
							</div>
						</div>
						<div class="box-bottom">
							<div class="box_right_info">
								<span class="list listcard">卡号：
									<el-tooltip v-if="hasEditCardInfo" class="item" effect="dark" content="修改卡号" placement="top">
										<b class="normoal is_edit" @click="showUpdateCardPopper({key: 'cardid', data: item,}, $event)">{{item.cardid}}</b>
									</el-tooltip>
									<b v-else class="normoal">{{item.cardid}}</b>
								</span>
							</div>
							<div class="youx">
								<span class="list listcard">有效期至：
									<el-tooltip v-if="hasEditExpireDate && ['20151212', '20161012'].indexOf(item.cardtypeid) === -1" 
										class="item" effect="dark" content="修改有效期" placement="top">
										<b class="normoal is_edit" @click="showUpdateCardPopper({key: 'invaliddate', data: item, type: 'datepicker'}, $event)">{{item.invaliddate ? item.invaliddate : '不限期'}}</b>
									</el-tooltip>
									<b v-else class="normoal">{{item.invaliddate ? item.invaliddate : '不限期'}}</b>
								</span>
							</div>
							<div class="consume">
								<span>开卡于{{item.opendate}}日</span>
								<span v-if="item.cardtype !== '2'">
									，总消耗卡金:￥ {{item.sumConsumeFee}}
								</span>
							</div>
						</div>

					</div>
					<div class="remarks">
						<span>备注：
							<b @click="showUpdateCardPopper({key: 'cardRemark', data: item, type: 'textarea'}, $event)" class="bold">
								<span class="renowarp">{{item.cardRemark}}</span>
								<am-icon slot="reference" size="12px" name="fanganbianji" class="gary"></am-icon>
							</b>
						</span>
					</div>
				</el-card>
			</div>

			<div class="qianIcon" v-if="cards.length == 0">
				<div class="am_empty_tips-icon">
					<am-icon size="40px" name="wushuju"></am-icon>
				</div>
				<p class="tips-text">
					<slot name="text">还没有开通过会员卡~</slot>
				</p>
			</div>
		</div>
		<Newmeal :mealListdata="setMeal" :ysetMeal="ysetMeal" @update-combo="showUpdateCardPopper" :has-edit-expire-date="hasEditExpireDate" :gsetMeal="gsetMeal" @mealoperation="mealoperation" @udpTreatComment="udpTreatComment" @udpTreatValidDate="udpTreatValidDate"  :locking="memberData.locking"></Newmeal>
		<div class="membercard arrear">
			<div class="basetitle"><span>欠款</span></div>
			<el-card class="box-card" v-if="arrearsList.length > 0">
				<el-table
					size="mini"
					:data="arrearsList">
					<el-table-column prop="billNO" label="单号" width="160"></el-table-column>
					<el-table-column prop="type" label="欠款类型">
						<template slot-scope="scope">
							<span>{{ Debt[scope.row.type] }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="debtTime" label="欠款日期"></el-table-column>
					<el-table-column prop="debtFee" label="欠款总额">
						<template slot-scope="scope">
							<span>￥{{ scope.row.debtFee }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="remainFee" label="未还金额">
						<template slot-scope="scope">
							<span class="yet">￥{{ scope.row.remainFee ? scope.row.remainFee : 0 }}</span>
						</template>
					</el-table-column>
				</el-table>
				<div class="total">欠款总次数：{{arrearsCount}}&nbsp;&nbsp;未还总额：<b>￥{{arrearsMoney ? arrearsMoney : 0}}</b></div>
			</el-card>
			<div class="qianIcon" v-if="arrearsList.length == 0">
				<div class="am_empty_tips-icon">
					<am-icon size="40px" name="wushuju"></am-icon>
				</div>
				<p class="tips-text">
					<slot name="text">没有任何欠款~</slot>
				</p>
			</div>
		</div>
		
		<el-dialog
			title="基本资料"
			:visible.sync="DialogVisible"
			width="513px"
			class="baseinfo"
			center>
			<el-form :model="editInfo" label-width="70px">
				<el-form-item label="姓名" class="nameinput">
				    <el-input class="name" v-model="editInfo.name"></el-input>
				</el-form-item>
				<el-form-item label="性别" class="sex">					
					<am-icon size="20px" name="Group3" class="sexn"></am-icon>
					<el-switch
					    class="switchdemo"
						style="display: block"
						v-model="sex"
						@change="selectSex"
						active-color="#4DA1FF"
						inactive-color="#FF80AB"
						active-text="男客"
						inactive-text="女客">
					</el-switch>
					<am-icon size="20px" name="Group1" class="sexl"></am-icon>
				</el-form-item>
				<el-form-item label="昵称">
					<el-input v-model="editInfo.mgjnickname"></el-input>
				</el-form-item>
				<el-form-item label="手机">
					<el-input v-model="editInfo.mobile" type="number"></el-input>
				</el-form-item>
				<el-form-item label="生日">
					<el-date-picker
						v-model="editInfo.birthday"
						type="date"
					>
					</el-date-picker>
				</el-form-item>
				<el-form-item label="来源">
					<el-select v-model="editInfo.mgjsourceid" placeholder="请选择">
						<el-option
						    v-for="(type) in sourceOptions" :key="type.id" :label="type.sourceName" :value="type.id"
						>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="介绍人" v-if="editInfo.mgjsourceid == 3" class="introducename">

					<el-input placeholder="输入会员手机号或者姓名搜索" v-model="editInfo.introducername" clearable>
						<template slot="prepend">
							<div @click="showShops" class="pointer">
								{{customershopstext}}
								<i class="el-icon-arrow-down"></i>
							</div>
						</template>

						<template slot="append">
							<span @click="querySearchAsync" class="pointer"><am-icon size="14px" name="xingzhuang" class="gary"></am-icon></span>
						</template>
					</el-input>
					<div class="produceList" v-if="iscustomershops">
						<ul>
							<li v-for="(item, index) in customershops" :key="index" @click="changeShop(item)">
								{{item}}
							</li>
						</ul>
					</div>


					<div class="produceList" v-if="queryList && queryList.length">
						<ul >
							<li v-for="(item, index) in queryList" :key="index" @click="handleCommand(item)">
								{{item.value}}
							</li>
						</ul>
					</div>
				</el-form-item>
			    <el-form-item label="备注">
					<el-input type="textarea" maxlength="100" v-model="editInfo.page" :disabled="disableRemark"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="customerEdit(editInfo)" class="modfiybtn">确定修改</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<el-dialog
			title="删除卡"
			:visible.sync="delVisible"
			width="30%"
			>
			<span>卡片删除后仅可在后台恢复，确认删除么？</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="delVisible = false">返回</el-button>
				<el-button type="primary" @click="delcardopen">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog
			:title="!memberData.passwd ? '设置密码' : '修改密码'"
			:visible.sync="pwdVisible"
			width="430px"
		>
			<el-form :model="modfiycard" label-width="60px">
				<el-form-item :label="memberData.passwd && succpwd == 0 ? '原密码' : memberData.passwd && succpwd == 1 ? '新密码' : '密码'">
					<el-input v-model="modfiycard.pwd" type="password" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,'');" class="mdf"></el-input>
				</el-form-item>
			</el-form>
			<div style="text-align: right; margin: 0">
				<el-button size="mini" @click="pwdVisible = false;">取消</el-button>
				<el-button type="primary" size="mini" @click="setPwd" class="makesure">确定</el-button>
			</div>
		</el-dialog>
		<Setmealmodal v-if="mealVisible" :Listdata="mealListInfo" @close="close" :memberData="memberData"></Setmealmodal>
		<ReTreat v-if="retreatVisible" :Listdata="mealListInfo" :cards="cards" @returnTreatItems="returnTreatItems" @close="closeTr"></ReTreat>
		<div class="popupwarp"></div>
		<verifiy-modal v-if="verVisible" @verInfo="verInfo" @verclose="verclose"></verifiy-modal>
		<div class="popup">
			<div class="popup_tit"><span class="poptite">{{isType == 1 ? '卡金转入' : '卡金转出'}}</span><b @click="closeCard">×</b></div>
				<div class="card_from">
					<div class="card_no nolist">
						<span class="line_tit">{{isType == 1 ? '转入卡号' : '转出卡号'}}：</span>
						<span class="line_val">{{guanbi.cardid}} ({{guanbi.cardtypename}})</span>
					</div>
					<div class="card_fee nolist">
						<span class="line_tit">卡金余额：</span>
						<span class="line_val">￥{{guanbi.cardfee}}</span>
					</div>
					<div class="card_shop nolist">
						<span class="line_tit">开卡门店：</span>
						<span class="line_val">{{guanbi.cardShopName}}</span>
					</div>
					<div class="card_pfee nolist">
						<span class="line_tit">赠金余额：</span>
						<span class="line_val">￥{{guanbi.presentfee}}</span>
					</div>
				</div>
				<div class="card_to init">
					<span>转{{isType == 1 ? '出' : '入'}}卡号：</span>
					<el-tooltip class="item" effect="dark" :content="keyword" placement="top" v-if="keyword && keyword.length > 50">
						<el-input class="win_input" clearable @keyup.enter.native="onQuery" v-model="keyword" placeholder="输入会员手机号或姓名或卡号搜索" :disabled="iskeyword ? true : false">
							<template slot="append">
								<span  @click="searchcard" v-if="!iskeyword"><am-icon size="14px" name="xingzhuang" class="gary"></am-icon></span>
								<span  @click="searchremove" v-if="iskeyword"><am-icon size="14px" name="qingchu1" class="gary"></am-icon></span>
							</template>
						</el-input>
					</el-tooltip>
					<el-input v-if="!(keyword && keyword.length > 50)" class="win_input" @keyup.enter.native="onQuery" v-model="keyword" placeholder="输入会员手机号或姓名或卡号搜索" :disabled="iskeyword ? true : false">
						<template slot="append">
							<span  @click="searchcard" v-if="!iskeyword"><am-icon size="14px" name="xingzhuang" class="gary"></am-icon></span>
							<span  @click="searchremove" v-if="iskeyword"><am-icon size="14px" name="qingchu1" class="gary"></am-icon></span>
						</template>
					</el-input>
				
					<div class="showcardlist" v-if="searchCardList && searchCardList.length && isShowcard">
						<ul class="chosecard">
							<li v-for="(item, index) in this.searchCardList" @click="choseCard(item)" :key="index">{{item.name}}{{item.cardName}}({{item.cardNo}}) 卡金：{{item.balance}} 赠金：{{item.gift}}</li>
						</ul>
					</div>
				</div>
				
				<div class="card_trans_total">
					<div class="trans_fee">
						<span>转{{isType == 1 ? '出' : '入'}}卡金：</span>
						<input class="am-clickable" type="" name="" placeholder="0" v-model="fee" min="0">元
					</div>
					<div class="trans_pfee">
						<span>转{{isType == 1 ? '出' : '入'}}赠金：</span>
						<input class="am-clickable" type="" name="" placeholder="0" v-model="feez" min="0">元
					</div>
				</div>
				<div class="foot_btns">
					<el-button class="btn_cancel am-clickable" @click="closeCard">取消</el-button>
					<el-button type="primary" class="sure_btn am-clickable" @click="cardfeeZ">确定</el-button>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import Popper from 'popper.js';
import IsNumber from 'is-number'
import Api from '@/api'
import Axios from '@/js/http'
import Cookie from 'js-cookie'
import Dayjs from 'dayjs'
import UploadImage from '@/components/upload-image';
import {getPicture, imgClass} from '@/utils/imgConfig';
import Setmealmodal from "./setmealmodal";
import Newmeal from "./newmeal";
import ReTreat from "./retreat";
import AppConfig from '@/config/app'
const DateFormat = 'YYYY-MM-DD HH:mm'
const DateFormatType = 'YYYY-MM-DD'
import MetaDataMixin from '#/mixins/meta-data'
import VerifiyModal from "#/components/verifiy-modal";
import Rollout from "#/components/roll-out";
import ActionConfirm from '#/components/delete-confirm'
const UpdateCardInfoConfig = {
	cardRemark: {
		url: "/memberDetail!udpCardComment.action",
		valid: (value, cardData) => {
			return !value || value.length <= 200;
		},
		validErrorMsg: '备注最多只能输入 200 个字',
		attrs: {
			placeholder: '您可以输入0-200个字符备注内容',
			maxlength: 100
		}
	},
	cardfee: {
		paramKey: 'cardFee',
		url: "/memberDetail!updCardFee.action",
		valid: (value, cardData) => {
			if (IsNumber(value) ) {
				const strValue = String(value);
				const dotIndex = strValue.indexOf('.') + 1;
				const numLength = dotIndex === 0 ? strValue.length : dotIndex;
				const dotLength = dotIndex === 0 ? 0 : strValue.length - dotIndex;
				return (dotLength <= 2 && numLength <= 10);
			}
			return false;
		},
		validErrorMsg: '请输入正确的卡金，最多允许两位小数，最大为十位整数，'
	},
	presentfee: {
		paramKey: 'presentFee',
		url: "/memberDetail!updCardPresentFee.action",
		valid: (value, cardData) => {
			if (IsNumber(value) ) {
				const strValue = String(value);
				const dotIndex = strValue.indexOf('.') + 1;
				const numLength = dotIndex === 0 ? strValue.length : dotIndex;
				const dotLength = dotIndex === 0 ? 0 : strValue.length - dotIndex;
				return (dotLength <= 2 && numLength <= 10);
			}
			return false;
		},
		validErrorMsg: '请输入正确的赠金，最多允许两位小数，最大为十位整数，'
	},
	discount: {
		url: "/memberDetail!updCardDiscount.action",
		valid: (value, cardData) => {
			const strValue = String(value);
			const dotIndex = strValue.indexOf('.') + 1;
			const dotLength = dotIndex === 0 ? 0 : strValue.length - dotIndex;
			return (dotLength <= 1 && value >= 0 && value <= 10);
		},
		validErrorMsg: '折扣只能是 0-10 的数字，且只能有一位小数'
	},
	invaliddate: {
		url: "/memberDetail!updCardInvalidDate.action",
	},
	cardid: {
		paramKey: 'cardId',
		url: "/memberDetail!editMemberCardId.action",
		valid: (value) => {
			return value && value.length <= 35;
		},
		validErrorMsg: '卡号不可为空，且长度最大为 35 个字符',
		postDataBuilder: (postData, cardData) => {
			const {
				id,
				shopid,
				cardtypeid,
				cardid,
			} = cardData;
			return {
				...postData,
				id,
				oldCardId: cardid,
				cardTypeId: cardtypeid,
				shopId: shopid,
			}
		}
	},
	// 套餐有效期
	validdate: {
		url: "/memberDetail!udpTreatValidDate.action",
		postDataBuilder: (postData, comboData) => {
			const { id } = comboData;
			return {
				...postData,
				id,
			}
		}
	},
	// 套餐备注
	itemRemark: {
		url: "/memberDetail!udpTreatComment.action",
		postDataBuilder: (postData, comboData) => {
			const { id } = comboData;
			return {
				...postData,
				id,
			}
		},
		valid: (value, cardData) => {
			return !value || value.length <= 100;
		},
		validErrorMsg: '备注最多只能输入 100 个字',
		attrs: {
			placeholder: '您可以输入0-100个字符备注内容',
			maxlength: 100
		}
	}
}
export default {
	name: 'customerBasics',
	mixins: [
		MetaDataMixin,
	],
	props: ['sourceName'],
	components: {
		Setmealmodal,
		ReTreat,
		Newmeal,
		VerifiyModal,
		Rollout
	},
	data() {
		return {
			updatePopperVm: {
				value: '',
				params: {}
			},
			visible: false,
			picloadshow: false,
			loading: true,
			initloading: false,
			menuArr: [], // 显示修改权限数组
			customerEditList: {}, // 存储修改基本资料数据
			keysdata: null,
			editCard: {},
			rollVisible: true, // 卡金转出
			verVisible: false,
			succpwd: 0,
			gsetMeal: [],
			ysetMeal: [],
			mList: null,
			retreatVisible: false,
			mealVisible: false,
			delVisible: false,
			pwdVisible: false,
			modfiycard: {
				cardId: null,
				cardtext: '',
				cardRemark: '',
				cardfee: null,
				presentfee: null,
				discount: null,
				pwd: null,
			},
			cards: [], // 获取卡信息
			newcards: {},
			setMeal: [], // 套餐信息
			invaliddate: '',
			tc: {
				tcremarks: '',
				validdate: ''
			},
			queryData: {
				memberid: this.$route.params.id,
			},
			sex: false,
			DialogVisible: false,
			visiblemeal: false,
			visiblemarks: false,
			sourceOptions: [],
			editInfo: {},
			cardList: [],
			operationList: [
				{
					name: '卡金转出',
					icon: 'zhuanchu'
				},
				{
					name: '卡金转入',
					icon: 'Group'
				},
			],
			// 套餐消耗记录
			mealListInfo: {
				list: undefined,
				info: {},
			},
			// 欠款列表
			arrearsList: [],
			// 头像
			getOper: {}, // 存单项信息
			guanbi: {}, // 转入卡信息
			keyword: '', // 卡信息
			searchCardList: [], // 查询卡信息
			searchCard: [], // 查询一张卡信息
			fee: 0,
			feez: 0,
			memberData: {}, // 获取会员基本信息,
			isType: 0, // 判断是否是卡金转入还是转出
			avatarUrlTs: new Date().getTime(),
			queryList: [], // 搜索介绍人
			Debt: {
				1: '项目消费',
				2: '充值',
				3: '卖品',
				4: '购买套餐',
				5: '其他',
			},
			disableRemark: true,
			mobile: '', // 手机号隐藏4位问题
			isChange: 0, // 判断是否有改的手机号
			allQuan: false, //没有任何权限并且设置密码
			isShowcard: false, // 是否显示卡列表
			iskeyword: false, // 是否有值
			birthday: '',
			scroll: '', // 滚动高度
			customershops: [
				"本店",
				"分店",
			],
			customershopstext: "本店",
			iscustomershops: false
		}
	},
	async mounted() {
		this.$refs.updatePopperDom.addEventListener('click', (e) => {
			e.stopPropagation();
		})
		this.initLoading = true;
		const res = await Api.getMetaData();
		this.initLoading = false;
		const resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
		this.disableRemark = this.$eventBus.env.userInfo.operateStr.indexOf('Y,') > -1 ? false : true
		this.customerDetail()
	},

	computed: {
		avaterUrl() {
			return `${AppConfig.IMAGE_URL}/customer/${this.parentShopId}/${this.queryData.memberid}_s.jpg?ts=${this.avatarUrlTs}`;
		},
		arrearsMoney() {
			const remainFee = this.arrearsList.map(item => item.remainFee);
			let yettotal;
			if (!remainFee.every(value => isNaN(value))) {
				yettotal = remainFee.reduce((prev, curr) => {
					const value = Number(curr);
					if (!isNaN(value)) {
						return prev + curr;
					} else {
						return prev;
					}
				}, 0);
			}
			return yettotal
		},
		arrearsCount() {
			const Yet = this.arrearsList && this.arrearsList.filter(item => {
				if (item.remainFee > 0) {
					return item.remainFee
				}
			});
			return Yet.length
		},
		source() {
			let sourceName = this.$eventBus.env.customerSources && this.$eventBus.env.customerSources.filter(item => {
				if (this.memberData.mgjsourceid === item.id) {
					return item.id
				}
			})
			return sourceName && sourceName[0] && sourceName[0].sourceName
		},
		hasEditCardInfo() {
			// 此权限不存在即视为可修改，存在则禁止修改
			return this.userOperateList.indexOf('r') === -1;
		},
		hasEditCardFee() {
			// 修改卡金赠金权限
			return this.userOperateList.indexOf('A') !== -1;
		},
		hasEditExpireDate() {
			// 修改到期日权限，卡与套餐
			return this.userOperateList.indexOf('Z') !== -1;
		}
	},
	methods: {
		destroyPopper($event) {
			const { instance } = this.updatePopperVm;
			this.updatePopperVm.prevDom = null;
			instance && instance.destroy();
			document.body.removeEventListener('click', this.destroyPopper);
		},

		updateCardDataForPopper() {
			const { value, params } = this.updatePopperVm;
			const { key, data: cardData } = params;
			const currentInfoKeyConfig = UpdateCardInfoConfig[key];
			if (!currentInfoKeyConfig) {
				console.error(`未找到 ${key} 对应的修改配置`);
				return;
			}
			const { url, valid, validErrorMsg, paramKey, postDataBuilder } = currentInfoKeyConfig;
			if (valid && !valid(value, cardData)) {
				this.$message.error(validErrorMsg);
				return;
			}
			const { id } = cardData;
			let postData = { cardId: id };
			if (postDataBuilder) {
				postData = postDataBuilder(postData, cardData);
			}
			postData[paramKey || key] = value;
			postData.shopid = this.memberData.shopid;
			ActionConfirm.open({postData, requestUri: url}).then(() => {
				params.data[key] = value;
				if (['invaliddate', 'validdate'].includes(key)) {
					this.getData(3)
				}
				this.$message.success('修改成功！');
			});
		},

		showUpdateCardPopper(params, $event) {
			$event.stopPropagation();
			const { data, key, type } = params;
			if (["cardfee", "presentfee", 'invaliddate', 'validdate'].includes(key) && this.memberData.locking === 2 && this.userOperateList.indexOf('U') === -1) {
				this.$message.warning('会员被锁定,请在会员详情解锁。')
				return;
			}
			const currentInfoKeyConfig = UpdateCardInfoConfig[key];
			if (!currentInfoKeyConfig) {
				console.error(`未找到 ${key} 对应的修改配置`);
				return;
			}
			const { prevDom } = this.updatePopperVm;
			if (prevDom === $event.target) return;
			this.updatePopperVm.prevDom = $event.target;
			this.updatePopperVm.value = data[key];
			params.attrs = currentInfoKeyConfig.attrs;
			this.updatePopperVm.params = params;
			this.updatePopperVm.instance = new Popper($event.target, this.$refs.updatePopperDom);
			document.body.addEventListener('click', this.destroyPopper);
		},

		// 关闭验证码弹框
		vclose() {
			this.verVisible = false
		},
		// 打开验证码弹框
		vopen() {
			this.verVisible = true
		},

		// 修改会员卡权限
		cardPermissions() {
			if (this.$eventBus.env.userInfo.operateStr.indexOf('R,') === -1) {
				this.$message.warning("您没有权限修改会员卡号!");
				return false;
			} else if (this.$eventBus.env.userInfo.operateStr.indexOf('A,') === -1) {
				// 判断有无权限修改余额和赠送金
				this.$message.warning("您没有权限修改余额和赠送金!");
				return false;
			}
			return true;
		},

		// 转化汉字为两个字符
		changeCharacter(val) {
			var len = 0;
			for (var i = 0; i < val.length; i++) {
				var a = val.charAt(i);
				if (a.match(/[^\x00-\xff]/ig) !== null) {
					len += 2;
				} else {
					len += 1;
				}
			}
			return len;
		},

		handleCommand(command) {
			// let osNameArr = command.cardshopname && command.cardshopname.filter(item => item.id === command.cardshopId)
			this.editInfo.introducername = command.value
			this.editInfo.introducerid = command.id
			this.queryList = []
		},

		hoverIn() {
			const obj = document.querySelector(".hoverIcon")
			obj.style.color = "#409EFF";
		},
		hoverOut() {
			const obj = document.querySelector(".hoverIcon")
			obj.style.color = "#C0C0C0";
		},

		// 渲染基本资料
		renderBaseInfo(content) {
			this.memberData = content.memberInfo
			this.birthday = content.memberInfo.birthday
			this.memberData.page = content.memberInfo.page ? content.memberInfo.page : "";
			this.memberData.birthday = content.memberInfo.birthday && content.memberInfo.birthday.length > 5 ? content.memberInfo.birthday.slice(5) : content.memberInfo.birthday;
			let introducename = this.$eventBus.env.shops && this.$eventBus.env.shops.filter(item => item.id === (content.memberInfo.introducer && Number(content.memberInfo.introducer.shopid)));
			this.memberData.introducername = content.memberInfo.introducer && `${content.memberInfo.introducer.name} | ${content.memberInfo.introducer.mobile}`
			let mobile;
			if (this.$eventBus.env.userInfo.operateStr.indexOf("MGJP") > -1) {
				mobile = content.memberInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'); // 手机号改为隐藏中间四位
			} else {
				mobile = content.memberInfo.mobile;
			}
			this.mobile = mobile

			if (this.$eventBus.env.userInfo && this.$eventBus.env.userInfo.operateStr.indexOf('X1', 'X2') === -1 && this.$eventBus.env.userInfo.operateStr.indexOf('K', 'E') === -1 && this.memberData.passwd) {
				this.allQuan = false
			} else {
				this.allQuan = true
			}
			
		},

		// 渲染会员卡
		renderCard(content) {
			const cardsConsumeTimesMap = {};
			content.memberInfo.cardsConsumeTimes.forEach(item => {
				cardsConsumeTimesMap[item.memberCardId] = item;
			})
			const newresData = content.cards.map( item => {
				const {
					opendate,
					lastconsumetime,
					shopname,
					invaliddate,
				} = item
				item.opendate = opendate ? Dayjs(opendate).format(DateFormatType) : ''
				item.lastconsumetime = Number(lastconsumetime) ? Number(Dayjs(lastconsumetime).format(DateFormatType)) : null
				const Invaliddate = IsNumber(invaliddate) ? Number(invaliddate) : invaliddate;
				item.invaliddate = invaliddate ? Dayjs(Invaliddate).format(DateFormatType) : '';
				const cardConsumeData = cardsConsumeTimesMap[item.id];
				item.sumConsumeFee = cardConsumeData ? cardConsumeData.sumConsumeFee : 0;
				return item
			})
			newresData.sort((a, b) => {
				return a.shopid - b.shopid;
			});
			// 有且只有一张散客卡并且余额赠金为0折扣为0||10
			if (newresData.length === 1 && (newresData[0].cardfee === "0" && newresData[0].presentfee === "0") && (newresData[0].discount === "0" || newresData[0].discount === "10") && newresData[0].cardtypeid === '20151212') {
				let initnewarr = {};
				for (let i = 0; i < newresData.length; i++) {
					if (!initnewarr[newresData[i].cardShopName]) {
						initnewarr[newresData[i].cardShopName] = [];
					}
					initnewarr[newresData[i].cardShopName].push(newresData[i]);
				}
				this.newcards = initnewarr
				this.cards = newresData
			} else {
				let currnewresData = newresData.filter(item => {
					return !((item.cardfee === "0" && item.presentfee === "0") && (item.discount === "0" || item.discount === "10") && item.cardtypeid === '20151212')
				})
				let newarr = {};
				if (currnewresData.length) {
					for (let i = 0; i < currnewresData.length; i++) {
						if (!newarr[currnewresData[i].cardShopName]) {
							newarr[currnewresData[i].cardShopName] = [];
						}
						newarr[currnewresData[i].cardShopName].push(currnewresData[i]);
					}
				}
				this.newcards = newarr
				this.cards = currnewresData
			}

		},

		// 渲染套餐
		renderTreatMentItems(contentdata) {
			// 展示套餐
			let newMeal = contentdata.treatMentItems.map(item => {
				const {
					buyDate,
					validdate,
					shopname,
				} = item
				item.validdate = validdate ? Dayjs(validdate).format(DateFormatType) : ''
				item.buyDate = buyDate ? Dayjs(buyDate).format(DateFormatType) : '';
				item.shopname = contentdata.shopname
				return item
			})
			let date = new Date().getTime()
			let yuMeal = contentdata.treatMentItems.filter(sub => sub.leavetimes !== 0 )
			yuMeal = yuMeal.filter(sub => {
				if ((sub.validdate.length > 0) && (date < Date.parse(sub.validdate)) || !sub.validdate) {
					return sub
				}
			})
			let usedMeal = contentdata.treatMentItems.filter(sub => sub.leavetimes === 0)
			let guoMeal = contentdata.treatMentItems.filter(sub => sub.validdate.length > 0)
			let guo = guoMeal.filter(item => (date > Date.parse(item.validdate)) && (item.leavetimes !== 0))
			this.setMeal = this.mealdata(yuMeal, 1) ? this.mealdata(yuMeal, 1) : []
			this.ysetMeal = this.mealdata(usedMeal, 2) ? this.mealdata(usedMeal, 2) : []
			this.gsetMeal = this.mealdata(guo, 3) ? this.mealdata(guo, 3) : []
		},
		
		// 获取会员详情
		customerDetail() {
			this.$parent.root.getMemberDetail().then(content => {
				this.loading = false
				this.renderBaseInfo(content)
				this.renderCard(content)
				this.renderTreatMentItems(content.memberInfo)
				this.queryDebt(this.memberData.shopid)
				this.picloadshow = true
				
			})
		},

		// 上传头像
		async onSelectWorkImage(e) {
			const file = e.target.files[0];
			const imageSrc = await this.$utils.renderFileAsDataURL(file);
			const parentShopId = this.$eventBus.env.userInfo.parentShopId;
			const customerId = this.memberData.id;
			let _posterImg = imgClass.getOptionObj('customer', {
				parentShopId,
				customerId
			})
			let uploadOption = {
				parentShopId,
				apiUrl: AppConfig.REQUEST_URL,
				apiCfg: _posterImg,
			};
			UploadImage.open({imageSrc, uploadOption}).then(res => {
				this.avatarUrlTs = new Date().getTime();
			});
		},

		// 格式化套餐数据
		mealdata(arrList, key) {
			// 展示全部套餐
			if (arrList && arrList.length) {
				let comboInfoObj = {};
				for (var i = 0; i < arrList.length; i++) {
					if (!comboInfoObj[arrList[i].shopid]) {
						comboInfoObj[arrList[i].shopid] = [];
					}
					comboInfoObj[arrList[i].shopid].push(arrList[i]);
				}
				
				for (var ikey in comboInfoObj) {
					var arr = comboInfoObj[ikey];
					var map = {};
					let	res = [];
					for (var g = 0; g < arr.length; g++) {
						var ap = arr[g];
						if (!map[ap.treatPackageId]) {
							res.push({
								treatPackageId: ap.treatPackageId,
								treatPackageName: ap.treatPackageName,
								data: [ap],
								goods: ap && ap.outdepot && ap.outdepot.details
							});
							map[ap.treatPackageId] = ap;
						} else {
							for (var q = 0; q < res.length; q++) {
								var dq = res[q];
								if (dq.treatPackageId === ap.treatPackageId) {
									dq.data.push(ap);
									break;
								}
							}
						}
					}
					comboInfoObj[ikey] = res;
				}

				this.mList = Object.assign({}, comboInfoObj);
				let mList = Object.keys(this.mList).map((key, item) => {
					return this.mList[key]
				})
				return mList
			}
		},

		// 修改刷新会员列表
		getData(num) {
			const data = {
				memberid: this.queryData.memberid,
				empId: this.$eventBus.env.userInfo.userId,
				parentShopId: this.parentShopId,
				shopId: this.$eventBus.env.userInfo.shopId,
			}
			this.$http.post('/memberDetail!detail.action', data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					if (num === 1) {
						this.renderBaseInfo(resData.content)
					} else if (num === 2) {
						this.renderCard(resData.content)
					} else {
						this.renderTreatMentItems(resData.content.memberInfo)
					}
				}	
			}).catch(() => {
				this.tableLoading = false;
			})
		},



		// 修改会员卡
		modfiyRemarks(data) {
			this.modfiycard.cardRemark = data.cardRemark
			this.modfiycard.cardId = data.id
			this.modfiycard.cardtext = data.cardid
			this.modfiycard.cardfee = data.cardfee && Number(data.cardfee)
			this.modfiycard.presentfee = data.presentfee
			this.modfiycard.discount = data.discount
			this.invaliddate = data.invaliddate

			if (this.memberData.locking === 2) {
				this.$message.warning("会员被锁定,请在会员详情解锁。")
				return
			}
		},

		// 显示套餐
		tcremarks(data) {
			this.tc.tcremarks = data.itemRemark
			this.tc.validdate = data.validdate
		},

		// 选择性别
		selectSex() {
			this.editInfo.sex = this.sex === false ? 'F' : 'M';
		},

		// 显示编辑modal
		show() {
			let that = this
			that.queryList = []
			if (that.$eventBus.env.userInfo.operateStr.indexOf("R") !== -1) {
				that.DialogVisible = true
				that.sourceOptions = that.sourceName
				that.editInfo = {
					name: that.memberData.name,
					mgjnickname: that.memberData.mgjnickname,
					mobile: that.memberData.mobile,
					page: that.memberData.page,
					birthday: that.birthday,
					introducerid: that.memberData.introducerid,
					mgjsourceid: that.memberData.mgjsourceid,
					sex: that.memberData.sex,
					introducername: that.memberData.mgjsourceid === 3 ? that.memberData.introducername : ''
				}
				if (that.memberData.sex === "M") {
					that.sex = true
				}
			} else {
				that.$message.warning("你没有权限进行此操作")
			}
		},
		showShops() {

			this.iscustomershops = this.iscustomershops === true ? false : true;
		},
		changeShop(item) {
			this.customershopstext = item
			this.iscustomershops = false
		},
		// 会员编辑
		customerEdit(data) {
			let that = this
			if (!that.editInfo.name) {
				that.$message.info('会员名称不能为空')
			} else if (that.editInfo.mgjnickname && that.editInfo.mgjnickname.length > 20) {
				that.$message.info('请输入0-20个字符昵称')
			} else if (that.editInfo.name && that.editInfo.name.length > 20) {
				that.$message.info('请输入0-20个字符姓名')
			} else if ((that.editInfo.mobile.length < 4 || that.editInfo.mobile.length > 11 )) {
				that.$message.info('请输入4-11个字符手机号')
			} else if (that.editInfo.page && that.editInfo.page.length > 200) {
				that.$message.info('请输入0-200个字符备注')
			} else {
				if (this.$eventBus.env.userInfo.operateStr.indexOf("R") !== -1) {
					// 是否修改基本资料
					this.menuArr = [];
					this.menuArr.push("基本资料")
					this.customerEditList = data
					this.verVisible = true
					if (that.editInfo.mobile === that.memberData.mobile) {
						this.isChange = 0
					} else {
						this.isChange = 1
					}
				} else {
					this.$message.warning("没有开启修改会员资料的权限")
				}
			}
		},
		// 关闭验证码取消
		verclose() {
			this.verVisible = false
		},
		// 修改基本资料
		customerEditInfo(code) {
			let that = this
			const uri = '/memberDetail!editMember.action';
			const postdata = {
				memberid: that.$route.params.id,
				sourceId: that.editInfo.mgjsourceid,
				birthType: 1,
				code,
				shopId: that.memberData.shopid,
				parentShopId: this.parentShopId,
				isChange: this.isChange,
				...that.customerEditList,
				introducerid: that.editInfo.introducerid,
				birthday: that.editInfo.birthday && Dayjs(that.editInfo.birthday).format(DateFormatType),
				page: encodeURIComponent(that.editInfo.page),
			}
			Axios.post(uri, postdata).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					that.$message.success('修改成功');
					that.DialogVisible = false
					that.iscustomershops = false
					that.memberData.introducername = ''
					that.getData(1)
				} else {
					// this.$message.warning(resData.message);
					that.DialogVisible = false
					that.iscustomershops = false
				}
			})
		},

		// 调用打开lock
		openlock() {
			if (this.$eventBus.env.userInfo.operateStr.indexOf('U1') !== -1) {
				this.$emit('openlocking')
			} else {
				this.$message.warning("无权限操作解锁、锁定")
			}
		},

		// 调用会员卡公共方法
		comCard(item, key) {
			this.editCard = item
			this.keysdata = key
			
			this.vopen()
			item.visiblecardfee = false;
			item.visiblesumpresentfee = false;
			item.visibleabledate = false;
			item.visiblediscount = false;
			item.visiblemarks = false;
		},

        // 显示会员卡修改信息
		udpCarddata(item, key) {
			if (key === 1) {
				this.menuArr = []
				this.menuArr.push("修改备注");
				this.comCard(item, key)
			} else if (key === 2) {
				// 判断有权限修改余额和赠送金 并且是普通卡
				if ((item.timeflag === "0" && item.cardtype !== "2" ) && this.$eventBus.env.userInfo.operateStr.indexOf('A,') > -1) {
					this.menuArr = []
					this.menuArr.push("修改卡余额");
					this.comCard(item, key)
				} else if (item.cardtype === "2" || item.timeflag === "1") {
					this.$message.warning("该卡不支持修改卡金和赠金余额")
					item.visiblecardfee = false;
				} else if (item.cardtype === "1" && (item.timeflag === "1" || item.timeflag === "3")) {
					this.$message.warning("该卡不支持修改卡金和赠金余额")
					item.visiblecardfee = false;
				} else {
					this.$message.warning("该卡无权限操作修改卡余额")
					item.visiblecardfee = false;
				}
			} else if (key === 3) {
				// 判断有权限修改余额和赠送金 并且是普通卡
				if ((item.timeflag === "0" && item.cardtype !== "2" ) && this.$eventBus.env.userInfo.operateStr.indexOf('A,') > -1) {
					this.menuArr = []
					this.menuArr.push("修改卡赠金");
					this.comCard(item, key)
					
				} else if (item.cardtype === "2" || item.timeflag === "1") {
					this.$message.warning("该卡不支持修改卡金和赠金余额")
					item.visiblesumpresentfee = false;
				} else if (item.cardtype === "1" && (item.timeflag === "1" || item.timeflag === "3")) {
					this.$message.warning("该卡不支持修改卡金和赠金余额")
					item.visiblesumpresentfee = false;
				} else {
					this.$message.warning("该卡无权限操作修改卡赠金")
					item.visiblesumpresentfee = false;
				}
			} else if (key === 4) {
				//判断有没有权限修改到期日
				if (this.$eventBus.env.userInfo.operateStr.indexOf('Z,') > -1) {
				//散客卡、套餐消费卡应不能修改到期时间
					if (item.cardtypeid !== "20151212" && item.cardtypeid !== "20161012") {
						this.menuArr = [];
						this.menuArr.push("修改到期日");
						this.comCard(item, key)
					} else {
						this.$message.warning("该卡不支持操作修改卡有效期")
						item.visibleabledate = false;
					}
				} else {
					this.$message.warning("该卡无权限操作修改卡有效期")
					item.visibleabledate = false;
				}
			} else if (key === 5) {
				// 折扣只受r的控制
				if (this.$eventBus.env.userInfo.operateStr.indexOf('r,') === -1) {
					this.menuArr = []
					this.menuArr.push("修改卡折扣");
					this.comCard(item, key)
				} else {
					this.$message.warning("该卡不支持修改卡折扣")
					item.visiblediscount = false;
				}
			}

		},
        // 权限集合
		verInfo(code) {
			if (this.menuArr.indexOf("基本资料") > -1) {
				this.customerEditInfo(code)
				this.verVisible = false
			} else if (this.menuArr.indexOf("修改备注") > -1) {
				this.udpCardComment(code)
				this.verVisible = false
			} else if (this.menuArr.indexOf("修改卡余额") > -1 || this.menuArr.indexOf("修改卡赠金") > -1) {
				this.udpCardComment(code)
				this.verVisible = false
			} else if (this.menuArr.indexOf("修改到期日") > -1 || this.menuArr.indexOf("修改卡折扣") > -1) {
				this.udpCardComment(code)
				this.verVisible = false
			} else if (this.menuArr.indexOf("修改会员卡号") > -1) {
				this.editCarddata(code)
				this.verVisible = false
			} else if (this.menuArr.indexOf("删除卡") > -1) {
				this.delcard(code)
				this.verVisible = false
			}
		},

		// 修改会员卡备注，卡金，赠金，有效期，折扣
		udpCardComment(code) {
			let data = {}
			let that = this
			const cardId = that.modfiycard.cardId;

			const updCard = function (uri, data) {
				Axios.post(uri, data).then(res => {
					const resData = res.data;
					if (resData.code === 0) {
						that.$message.success('修改成功');
						that.getData(2)
					} else {
						// that.$message.warning(resData.message);
						that.DialogVisible = false
						that.iscustomershops = false
					}
				})
			}
			if (this.keysdata === 1) {
				data = {
					cardRemark: that.modfiycard.cardRemark,
					cardFee: Number(this.editCard.cardfee),
					cardId,
					presentFee: Number(this.editCard.presentfee),
					discount: Number(this.editCard.discount),
					invaliddate: this.editCard.invaliddate,
					code: code
				}
				const uri = "/memberDetail!udpCardComment.action";
				updCard(uri, data)
				this.editCard.visiblemarks = false;
			} else if (this.keysdata === 2) {
				data = {
					cardFee: Number(that.modfiycard.cardfee),
					cardId,
					shopid: this.editCard.cardshopId,
					code: code
				}
				const uri = "/memberDetail!updCardFee.action";
				updCard(uri, data)
				this.editCard.visiblecardfee = false;
			} else if (this.keysdata === 3) {
				data = {
					cardId,
					shopid: this.editCard.cardshopId,
					presentFee: Number(that.modfiycard.presentfee),
					code: code
				}
				const uri = "/memberDetail!updCardPresentFee.action";
				updCard(uri, data)
				this.editCard.visiblesumpresentfee = false;
			} else if (this.keysdata === 5) {
				data = {
					cardId,
					discount: Number(that.modfiycard.discount),
					code: code
				}
				const uri = "/memberDetail!updCardDiscount.action";
				updCard(uri, data)
				this.editCard.visiblediscount = false;
			} else if (this.keysdata === 4) {
				const invaliddate = that.invaliddate
				data = {
					cardId,
					invaliddate: invaliddate,
					code: code
				}
				const uri = "/memberDetail!updCardInvalidDate.action";
				updCard(uri, data)
				this.editCard.visibleabledate = false;
			}
		},

		// 支持自选搜索
		querySearchAsync() {
			if (!this.editInfo.introducername) {
				this.queryList = []
				this.$message.info("请输入会员手机号或者姓名")
			} else {
				let shopIds = this.customershopstext === "本店" ? this.memberData.shopid : this.getshopIds(this.$eventBus.env.userInfo.shopIds).replace(`${this.memberData.shopid},`, "")
				const shops = {
					keyword: this.editInfo.introducername,
					pageNumber: 0,
					pageSize: 1500,
					parentShopId: Number(this.parentShopId),
					shopId: Number(this.memberData.shopid),
					shopIds: shopIds
				}
				this.$http.post('/memberDetail!search.action', shops).then(res => {
					this.tableLoading = false;
					const resData = res.data;
					if (resData.code === 0) {
						let idMaps = {};
						let queryMemberList = []; // 存储去重后的数组
						resData.content && resData.content.forEach(item => {
							const {
								value,
								cardshopname,
								id
							} = item
							item.cardshopname = this.$eventBus.env.shops
							item.value = `${item.name} ${item.mobile}`;
							if (!idMaps[id]) {
								queryMemberList.push(item);
								idMaps[id] = true;
							}
						})
						this.queryList = resData.content && resData.content.length > 0 ? queryMemberList : null
						if (resData.content && resData.content.length === 0) {
							this.$message.info("没有搜索到相关记录")
						}
					}
				}).catch(() => {
					this.tableLoading = false;
				})
			}
		},
		// 相同的手机号和会员去重
		uniq(array) {
			array.sort();
			let temp = [array[0]];
			for (let i = 1; i < array.length; i++) {
				if (array[i].name !== temp[temp.length - 1].name) {
					temp.push(array[i]);
				}
			}
			return temp;
		},

		// 修改会员卡
		editMember(item) {
			if (this.$eventBus.env.userInfo.operateStr.indexOf('r,') === -1) {
				if (this.modfiycard.cardId === '') {
					return this.$message.info("请输入新卡号!");
				}
				this.editCard = item
				this.menuArr = []
				this.menuArr.push("修改会员卡号");
				this.vopen()
			} else {
				this.$message.warning("无权限修改会员卡号")
			}
		},

		editCarddata(code) {
			const uri = "/memberDetail!editMemberCardId.action";
			const data = {
				id: this.modfiycard.cardId,
				cardId: this.modfiycard.cardtext,
				oldCardId: this.editCard.cardid,
				cardTypeId: this.editCard.cardtypeid,
				shopId: this.editCard.shopid,
				code: code
			}
			Axios.post(uri, data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					this.$message.success('修改成功');
					this.editCard.cardid = this.modfiycard.cardtext
				} else {
					this.DialogVisible = false
					this.iscustomershops = false
				}
			})
			this.editCard.visiblecard = false;
			this.vclose()
		},

		// 套餐备注
		udpTreatComment(item, remarks, code) {
			const uri = "/memberDetail!udpTreatComment.action";
			const data = {
				id: item.id,
				itemRemark: remarks,
				code
			}
			Axios.post(uri, data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					this.$message.success('修改成功');
					item.itemRemark = remarks
				} else {
					// this.$message.warning(resData.message);
					this.DialogVisible = false
					this.iscustomershops = false
				}
			})
			item.visiblemarks = false;
		},

		// 修改套餐过期时间
		udpTreatValidDate(item, validdate, code) {
			if (this.$eventBus.env.userInfo.operateStr.indexOf('Z') !== -1) {
				const uri = "/memberDetail!udpTreatValidDate.action";
				const data = {
					id: item.id,
					validdate: validdate,
					code
				}
				Axios.post(uri, data).then(res => {
					const resData = res.data;
					if (resData.code === 0) {
						this.$message.success('修改成功');
						item.validdate = validdate;
						this.getData(3)
					} else {
						// this.$message.warning(resData.message);
						this.DialogVisible = false
						this.iscustomershops = false
					}
				})
			} else {
				this.$message.warning("不支持修改套餐有效期")
			}

			item.visiblemeal = false;
		},
		
		// 欠款
		queryDebt(shopId) {
			this.$http.post('/memberDetail!queryDebtList.action', {
				memberid: this.$route.params.id,
				pageNumber: 0,
				pageSize: 9999,
				shopId,
			}).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					resData.content && resData.content.forEach(item => {
						const {
							debtTime,
						} = item
						item.debtTime = debtTime ? Dayjs(debtTime).format(DateFormatType) : '';
					})
					this.arrearsList = resData.content
				} else {
					// this.$message.warning(resData && resData.message);
				}	
			})
		},

		// 更多操作-设置密码
		operation(item, index) {
			if (index === 3) {
				this.pwdVisible = true
				this.rowObj = item

			} else if (index === 0) {
				if (this.memberData.locking === 2) {
					this.$message.warning("会员被锁定,请在会员详情解锁。")
				} else {
					const obj = document.querySelector('.popup');
					const popwarp = document.querySelector('.popupwarp');
					obj.style.display = "block";
					popwarp.style.display = "block";
					this.guanbi = item
					this.isType = 0
					this.rollVisible = true
				}
			} 
			else if (index === 1) {
				if (this.memberData.locking === 2) {
					this.$message.warning("会员被锁定,请在会员详情解锁。")
				} else {
					const obj = document.querySelector('.popup');
					const popwarp = document.querySelector('.popupwarp');
					obj.style.display = "block";
					popwarp.style.display = "block";
					this.guanbi = item
					this.isType = 1
				}
			} else if (index === 2) {
				this.getOper = item
				this.delVisible = true
			} else if (index === 4) {
				const uri = "/memberDetail!setPwd.action";
				const data = {
					shopid: this.memberData.shopid,
					memId: this.queryData.memberid,
					mobile: item.mobile,
					name: item.name,
					passwd: null
				}
				Axios.post(uri, data).then(res => {
					const resData = res.data;
					if (resData.code === 0) {
						this.$message.success('取消密码成功');
						this.memberData.passwd = null
					} else {
						this.$message.warning('失败');
					}
				}) .catch(function (error) {
					this.$message.warning('失败');
				});
				this.pwdVisible = false;
			}
		},
        

		// 设置密码
		setPwd() {
			if (this.memberData.passwd && this.succpwd === 0) {
				if (this.modfiycard.pwd !== this.memberData.passwd) {
					this.$message.info("原密码错误请重新输入")
					this.succpwd = 0
				} else if (this.modfiycard.pwd === this.memberData.passwd) {
					this.succpwd = 1
					this.modfiycard.pwd = '';
				} else {
					this.succpwd = 0
				}
			} 
			else if (this.succpwd === 1) {
				if (this.$eventBus.env.userInfo.operateStr.indexOf('X1') > -1) {
					const uri = "/memberDetail!setPwd.action";
					if (!this.modfiycard.pwd) {
						this.$message.info('密码不能为空');
					} else {
						const data = {
							memId: this.queryData.memberid,
							mobile: this.rowObj.mobile,
							name: this.rowObj.name,
							passwd: this.modfiycard.pwd
						}
						Axios.post(uri, data).then(res => {
							const resData = res.data;
							if (resData.code === 0) {
								this.$message.success('修改密码成功');
								this.getData(2)
							} else {
								this.$message.warning('失败');
							}
						}) .catch(function (error) {
							this.$message.warning('失败');
						});
						this.pwdVisible = false;
					}
				} else {
					this.$message.warning("无权限修改密码")
				}
			}
			else {
				const uri = "/memberDetail!setPwd.action";
				if (!this.modfiycard.pwd) {
					this.$message.info('密码不能为空');
				} else {
					const data = {
						memId: this.queryData.memberid,
						mobile: this.rowObj.mobile,
						name: this.rowObj.name,
						passwd: this.modfiycard.pwd
					}
					Axios.post(uri, data).then(res => {
						const resData = res.data;
						if (resData.code === 0) {
							this.$message.success('设置密码成功');
							this.getData(2)
							this.memberData.passwd = this.modfiycard.pwd
						} else {
							this.$message.warning('失败');
						}
					}) .catch(function (error) {
						this.$message.warning('失败');
					});
					this.pwdVisible = false;
				}
			}
		},
		// 关闭卡金转入
		closeCard() {
			const obj = document.querySelector('.popup');
			const popwarp = document.querySelector('.popupwarp');
			obj.style.display = "none";
			popwarp.style.display = "none";
			this.searchCardList = []
			this.fee = ''
			this.feez = ''
			this.keyword = ''
			this.iskeyword = false
		},
		clsoeCardMoney() {
			this.rollVisible = false
		},

		// 查询卡
		searchcard() {
			this.tableLoading = true;
			const shops = {
				keyword: this.keyword,
				pageNumber: 0,
				pageSize: 1500,
				parentShopId: Number(this.memberData.parentshopid),
				shopId: Number(this.$eventBus.env.userInfo.shopId),
				shopIds: this.getshopIds(this.$eventBus.env.userInfo.shopIds),
			}
			this.$http.post('/memberDetail!search.action', shops).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					if (resData.content && resData.content.length === 0) {
						this.$message.info('没有找到卡');
						this.isShowcard = false
					} else if (resData.content && resData.content.length > 0) {
						resData.content && resData.content.forEach(item => {
							let {
								shopname
							} = item
							item.shopname = this.memberData && this.memberData.shopname
						})
						this.guanbi.timeflag !== 1 && this.guanbi.cardtype !== 2
						this.searchCardList = resData.content.filter((subitem, index) => {
							return subitem.timeflag !== 1 && subitem.cardtype !== 2
						})
						if (resData.content && resData.content.length > 0 && this.searchCardList.length < 1) {
							this.$message.warning("资格卡和计次卡不能用来转账")
						}
						this.isShowcard = true
						this.searchCard = resData.content
					}
					
				}
			}).catch(() => {
				this.tableLoading = false;
			})
		},
		// 清空查询卡信息
		searchremove() {
			this.iskeyword = false
			this.keyword = ''
			this.searchCardList = []
		},
		
		delcardopen() {
			// 判断是否有权限删除会员
			if (this.$eventBus.env.userInfo.operateStr.indexOf('E') > -1) {
				this.menuArr = []
				this.menuArr.push("删除卡");
				this.vopen()
				this.delVisible = false
			} else {
				this.$message.warning("没有删除卡的权限")
			}
		},
		delcard(code) {
			this.tableLoading = true;
			const shops = {
				id: this.getOper.id,
				shopId: Number(this.getOper.shopid),
				parentShopId: Number(this.memberData.parentshopid),
				shopid: this.memberData.shopid,
				code
			}
			this.$http.post('/memberDetail!delMemberCard.action', shops).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					let newcardlist = this.cards.filter(item => item.id !== this.getOper.id)
					this.cards = newcardlist;
					this.$eventBus.$emit('delete_member_card', newcardlist);
					this.$message.success("删除成功！")
				}
			}).catch(() => {
				this.tableLoading = false;
			})
			this.delVisible = false
		},
		// 获取shopids集合
		getshopIds(id) {
			let res = [];
			let data = this.$eventBus.env;
			let shopList = data.shops;
			for (let i = 0; i < shopList.length; i++) {
				res.push(shopList[i].id);
			}
			return res.join(",");
		},
		// 确认卡金转入/卡金转出
		cardfeeZ() {
			if (!this.keyword) {
				this.$message.info("选择选好一张转出卡")
			} else {
				// 资格卡和计次卡不能转卡金 并且有权限
				if ((this.guanbi.timeflag !== 1 && this.guanbi.cardtype !== 2) && (this.searchCardList[0].timeflag !== 1 && this.searchCardList[0].cardtype !== 2)) {
					if (!this.keyword) {
						this.$message.info("选择选好一张转出卡")
					} else if (!this.fee) {
						this.$message.info("需要填入一个金额")
					} else if (this.keyword === this.searchCardList[0].cardid) {
						this.$message.info("不能选择同一张卡")
					} else {
						if ((this.$eventBus.env.userInfo.operateStr.indexOf('K1') !== -1) && (Number(this.guanbi.shopid) !== this.searchCardList[0].shopId)) {
							this.$message.warning("没有跨店转账权限！")
						} else {
							this.tableLoading = true;
							const shops = {
								shopid: Number(this.memberData.shopid),
								shopId: Number(this.memberData.shopid),
								parentShopId: Number(this.memberData.parentshopid),
								cardFee: this.fee ? Number(this.fee) : 0,
								inCardId: this.isType === 1 ? this.guanbi.id : this.searchCardList[0].cid,
								outCardId: this.isType === 1 ? this.searchCardList[0].cid : this.guanbi.id,
								presentFee: this.feez ? Number(this.feez) : 0
							}
							this.$http.post('/memberDetail!transferMemberCard.action', shops).then(res => {
								this.tableLoading = false;
								const resData = res.data;
								if (resData.code === 0) {
									
									if (this.isType === 1) {
										this.$message.success("卡金转入成功")
									} else {
										this.$message.success("卡金转出成功")
									}
									this.getData(2)
									this.searchCardList = []
									this.closeCard()
									this.iskeyword = false
								}
							}).catch(() => {
								this.tableLoading = false;
							})
						}
					}
				} else {
					this.$message.warning("资格卡和计次卡不能用来转账！")
				}
			}


		},

		// 多张卡列表记录
		choseCard(item) {
			this.keyword = ''
			this.searchCardList = []
			this.searchCardList.push(item)
			this.keyword = `${item.cardName}(${item.cardNo}) 卡金： ${item.balance} 赠金： ${item.gift}`
			this.isShowcard = false
			this.iskeyword = true
		},

		// 套餐更多操作
		mealoperation(item, index) {
			let that = this
			if (index === 0) {
				const shops = {
					treatmentid: Number(item.id),
					memberid: Number(that.$route.params.id),
					shopid: Number(item.shopid)
				}
				that.$http.post('/memberDetail!treatmentitemConsume.action', shops).then(res => {
					const resData = res.data;
					if (resData.code === 0) {
						if (resData.content && resData.content.length > 0) {
							this.mealVisible = true
							resData.content.sort((a, b) => {
								return b.CONSUMETIME - a.CONSUMETIME;
							});
							resData.content.forEach(item => {
								const {
									CONSUMETIME
								} = item
								item.CONSUMETIME = CONSUMETIME ? Dayjs(CONSUMETIME).format(DateFormatType) : '';
							})
							this.mealListInfo.list = resData.content
							this.mealListInfo.info = item
						} else {
							this.$message.info("没有套餐消耗记录")
						}
						
					}
				}).catch(() => {
					that.tableLoading = false;
				})
			} else if (index === 1) {
				if (this.$eventBus.env.userInfo.operateStr.indexOf('a7') > -1) {
					this.$message.info("套餐不可以退款")
				} else {
					this.retreatVisible = true
					this.mealListInfo.info = item
				}
			}
		},

		close() {
			this.mealVisible = false
		},
		closeTr() {
			this.retreatVisible = false
		},

		// 退套餐
		returnTreatItems(item, code, outCardId) {
			let that = this
			let shops = {
				inCardId: item.inCardId,
				outCardId,
				outMemberId: this.$route.params.id,
				parentShopId: this.parentShopId,
				shopId: this.mealListInfo.info.shopid,
				treatItemId: this.mealListInfo.info.id,
				treatMoney: item.treatMoney,
				treatNum: item.treatNum <= 0 ? 1 : item.treatNum,
				code,
			}
			that.$http.post('/memberDetail!returnTreatItems.action', shops).then(res => {
				that.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.$message.success("退套餐成功")
					this.getData(3)
				}
			}).catch(() => {
				that.tableLoading = false;
			})
		}
	},
}
</script>
<style lang="less">
	.update_popper_dom {
		padding: 12px;
		position: absolute;
		left: -9999px;
		top: -9999px;
		min-width: 260px;
		border: 1px solid #EBEEF5;
		background: #fff;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
		& .action_wrap {
			text-align: right;
			margin-top: 15px;
		}
	}
    .basicdata {
		margin: 23px 40px;
		.basetitle {
			width:100%;
			height:17px;
			font-size:13px;
			font-weight:bold;
			color:rgba(34,34,34,1);
			line-height:17px;
			.modfiy {
				height: 16px;
				width: 16px;
				float: right;
				color: #409EFF;
				cursor: pointer;
				&:hover {
					color: #1381f3;
				}
			}
		}
		.basebox {
			padding: 23px 15px;
			position: relative;
			.fanganbianji {
				width: 20px;
                height: 20px;
                display: inline-block;
				background-color: red;
				position: absolute;
           		top: 113px;
    			left: 452px;
    			border-radius: 50%;
    			line-height: 20px;
    			text-align: center;
    			color: #C0C0C0;
    			background: #f5f7fa;
    			cursor: pointer;
				z-index: 4;
				&:hover i {
					color: #409eff;
				}
			}
			.pointer {
				margin-left: 110px;
				color: #409EFF;
				cursor: pointer;
				&:hover {
					color: #1381f3;
				}
			}
			.repage {
				width: calc(100% - 138px);
				display: inline-flex;
			}
			li {
				color: #666666;
				padding: 7px 0px;
				b {
					width: 52px;
					display: inline-block;
					text-align: left;
					color: #666666;
					font-weight: normal;
				}
				span {
					color: #222222;
					i {
						height: 15px;
						width: 13px;
						display: inline-block;
						&:first-child{
							margin: 0px 6px 0px 12px;
						}
					}
				}
			}
			.customerPic {
				position: absolute;
				top: 55px;
				left: 396px;
				height: 80px;
				width: 80px;
				z-index: 5;
				opacity: 0;
				outline: none;
				cursor: pointer;
				background: url(../../assets/img/openbill-customer.png) no-repeat center;
			}
			.photolock {
				position: absolute;
				top: 53px;
				left: 394px;
				width: 83px;
				height: 83px;
				text-align: center;
				color: #fff;
				z-index: 9;
				background: #5857571f;
				border-radius: 50%;
				cursor: pointer;
				i {
					font-style: normal;
					display: block;
					&:first-child {
						padding-top: 23px;
					}
				}
			}
			.customerPic:hover .guan {
				color: #1381f3;
			}
			.HighQuality {
				border:3px solid rgba(247,212,109,1);
			}
			.noHighQuality {
				border:3px solid #ececec;
			}
			.img {
				width: 84px;
				height: 84px;
				display: inline-block;
				position: absolute;
				top: 53px;
				left: 394px;
				
				background: url(../../assets/img/openbill-customer.png) no-repeat center;
				background-size: contain;
				background-color: #ccc;
				border-radius: 50%;
				z-index: 1;
				cursor: pointer;
				&:hover .guan {
					color: #1381f3 !important;
				}
				img {
					width: 78px;
					border-radius: 50%;
				}
				.guan {
					width: 20px;
					height: 20px;
					display: inline-block;
					background-color: red;
					position: absolute;
					left: 55px;
					bottom: 2px;
					border-radius: 50%;
					line-height: 20px;
					text-align: center;
					color: #C0C0C0;
					background: #f5f7fa;
					z-index: 9;
					&:hover {
						color: #1381f3 !important;
					}
				}
				.huguan {
					width:22px;
					height:22px;
					background:rgba(0,0,0,1);
					position: absolute;
					left: 28px;
					top: -22px;
					background: url(../../assets/img/good.png) no-repeat center center;
					background-size: cover;
				}
			}
		}
	}
	.membercard {
		margin: 23px 40px;
		.basetitle {
			width:100%;
			height:17px;
			font-size:13px;
			font-weight:bold;
			color:rgba(34,34,34,1);
			line-height:17px;
			padding-bottom: 30px;
		}
		.shopname {
			color: #fff;
		}
		.shoptitle {
			color: #909090;
			b {
				height: 18px;
				width: 18px;
				background: #C5C5C5;
				border-radius: 50%;
				display: inline-block;
				line-height: 18px;
				text-align: center;
				margin-right: 8px;
			}
		}
		.el-card.is-always-shadow {
			box-shadow: none;
		}
		.el-card {
			&:hover {
				box-shadow:0px 1px 10px 0px rgba(0,0,0,0.08);
			}
			&:hover .list b.is_edit {
				border-bottom: 2px dotted #E1E1E1;
				cursor: pointer;
			}
		}

		.box-card {
			margin: 14px 0px 9px 0px;
			.el-table th>.cell {
				width: 100%;
				color: #909090;
				font-weight: normal;
			}
			.el-table tr:nth-child(odd) {
				background-color: #FAFAFA;
			}
			.el-table tr:nth-child(even) {
				background-color: #fff;
			}
			.yet {
				color: #DA3D4D;
				width: 50px;
				text-align: right;
				display: inline-block;
			}
			.box {
				overflow: hidden;
			}
			.box_top {
				text-align: right;
				float: right;
				padding: 10px 10px 0px 0px;
				width: 30px;
				height: 30px;
				cursor: pointer;
				&:hover i {
					color: #409eff;
				}
				.el-dropdown {
					cursor: pointer;
					i {
						color: #C1C1C1;
					}
					&:hover i {
						color: #409eff;
					}
				}
			}
			.box-tip {
				height: 40px;
				background: #FAFAFA;
				line-height: 40px;
    			text-indent: 14px;
				.cardnametitle {
					font-weight: bold;
					font-size: 13px;
					width: 28%;
					height: 40px;
					float: left;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.box_left {
					width: 141px;
					float: left;
					.nowarp {
						width: 140px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						b {
							width: 15px;
							height: 15px;
							text-align: center;
							border-radius: 50%;
							background-color: #EE3231;
							color: #fff;
							display: inline-block;
							font-weight: normal;
							font-size: 9px;
							line-height: 15px;
							margin: 0px 5px 0px 0px;
						}
					}
					p {
						font-size:12px;
						color:rgba(34,34,34,1);
						line-height:15px;
						padding: 0px;
						i {
							display: inline-block;
							width: 12px;
							height: 12px;
							margin-right: 9px;
						}
					}
				}
			}
			.box-bottom {
				.box_right_info {
					padding: 10px 14px;
					.normoal {
						font-weight: normal !important;
						// cursor: pointer;
					}
					
				}
				.youx {
					padding: 0px 12px 0px 14px;
					width: 38%;
					float: left;
					// cursor: pointer;
					.normoal {
						font-weight: normal !important;
						height: 20px;
						display: inline-block;
					}
					&:hover b.is_edit {
						border-bottom: 2px dotted #E1E1E1;
						cursor: pointer;
					}
				}
				.consume {
					color:rgba(193,193,193,1);
					text-align: left;
					margin-right: 65px;
					span {
						color: #909090;
						padding-right: 0px;
						display: inline-block;
					}
				}
			}

			.box_right {
				float: left;
				width: 67%;
				padding: 0px;
				.box_right_info {
					
					card {
						width: 40%;
						color: #333;
						.normoal {
							font-weight: normal !important;
							cursor: pointer;
						}
					}
					.cardfeebg {
						color: #333;
					}
					.yue {
						width: 33%;
					}
					.zhekou {
						padding-left: 35px;
					}
				    .list {
						display: inline-block;
						// cursor: pointer;
						// .bold {
						// 	color: #666666;
						// }
						b {
							padding-bottom: 7px;
							color: #333;
							// font-weight: normal !important;
						}
					}
				}
				.setMeal_info {
					.list_t_yxq {
						width: 40%;
					}
					.list_t {
						display: inline-block;
						cursor: pointer;
						&:first-child {
							b {
								border-bottom: 2px dotted #E1E1E1;
								padding-bottom: 7px;
							}
						}
					}
				}
			}
			.total {
				text-align: right;
				padding: 13px 10px 0px 0px;
				color: #333;
				b {
					color: #DA3D4D;
					font-weight: normal;
				}
			}
		}
		.card_d {
			.el-card__body {
				padding: 0px 0px 20px !important;
			}
		}
		.qianIcon {
			width: 100%;
			border-radius: 3px;
			border: 1px solid #F0F1F5;
			text-align: center;
			margin-top: 10px;
			.am_empty_tips-icon {
				padding: 20px 0px 5px;
				color: #A3A8AB;
			}
			.tips-text {
				color: #A9A9A9;
				padding: 0px 0px 20px;
			}
		}
		.remarks {
			display: block;
			height: 24px;
			margin-top: 20px;
			line-height: 44px;
			border-top: 1px solid rgba(240,241,245,1);
			color: #909090;
			padding: 0px 14px;
			cursor: pointer;
			.renowarp {
				max-width: 520px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				display: inline-block;
				font-weight: normal;
				vertical-align: middle;
			}
			i {
				display: inline-block;
				margin-right: 9px;
				margin-left: 6px;
				vertical-align: middle;
			}
			b {
				font-weight: normal;
			}
			&:hover .gary {
				color: #409EFF;
			}
		}
	}
	.setMeal {
		.box {
			margin-top: 17px;
		}
	}
	.customer_profile_basics {
		overflow-y: auto;
		height: 100vh;
		// &::-webkit-scrollbar {
		// 	width: 1px; /*对垂直流动条有效*/
		// 	height: 1px; /*对水平流动条有效*/
		// }
		// &::-webkit-scrollbar-track{
		// 	-webkit-box-shadow: inset 0 0 6px #fcfbfb;
		// 	background-color: #fcfbfb;
		// 	border-radius: 1px;
		// }
		.el-dialog {
			.nameinput,.sex {
				width: 49%;
				display: inline-block;
				vertical-align: -webkit-baseline-middle;
				.switchdemo {
					vertical-align: top;
    				margin-top: 5px;
					.el-switch__label.is-active {
						color: #fff;
					}
				}
			}
			.el-form-item {
				.modfiy {
					height: 20px;
					width: 13px;
					background-color: #90208c;
					display: inline-block;
					cursor: pointer;
					color: #409EFF;
					vertical-align: middle;
				}
			}
			.el-input--small {
				font-size: 13px;
				width: 351px;
				margin-left: 9px;
			}
			.name {
				width: 139px;
			}
			.el-dialog__header {
				text-align: left;
				font-weight:bold;
				.el-dialog__title {
					font-size: 13px !important;
				}
			}
			.el-form-item__label {
				font-size: 12px;
				color: rgba(102,102,102,1);
			}
			.modfiybtn {
				width: 351px;
				margin-left: 9px;
				height:37px;
			}
		}
	}
	.baseinfo {
		.pointer {
			cursor: pointer;
		}
		.produceList {
			box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, .15);
			border: 1px solid #dbdde1;
			border-radius: 3px;
			width: 352px;
			margin-top: 2px;
			position: absolute;
			top: 35px;
			left: 9px;
			z-index: 9;
			background-color: #fff;

			ul {
				overflow-y: auto;
				max-height: 100px;
				li {
					font-size: 12px;
					height: 25px;
					line-height: 25px;
					padding: 0px 10px;
					cursor: pointer;
					&:hover {
						background-color: #f5f7fa;
					}
				}
			}
		}
		.el-input__inner, .el-textarea__inner {
			color: #222;
		}
	}

	.makesure {
		width: 56px !important;
		height: 28px !important;
	}

	.switchdemo {
		height: 32px;
		line-height: 23px;
		width: 56px;
		display: inline-block !important;
	}
	.switchdemo .el-switch__label {
		position: absolute;
		display: none;
		color: #fff;

	}
	/*打开时文字位置设置*/
	.switchdemo .el-switch__label--right {
		z-index: 1;
		left: -4px;
	}
	/*关闭时文字位置设置*/
	.switchdemo .el-switch__label--left {
		z-index: 1;
		left: 20px;
	}
	/*显示文字*/
	.switchdemo .el-switch__label.is-active {
		display: block;
		position: absolute;
		top: 1px;
	}
	.switchdemo.el-switch .el-switch__core,
	.el-switch .el-switch__label {
		width: 56px !important;
	}

	// 修改popover显示样式。
	.el-popover {
		.el-form {
			margin-top: 10px;
			width: 234px;
		}
		.el-form-item__content {
            text-align: right;
		}
	}
	#modaltip {
		width: 100px;
		height: 100px;
		background-color: #222222;
		position: absolute;
		left: 0;
		top: 0;
	}
	.sexl {
		color: #4DA1FF;
	}
	.sexn {
		color: #FF80AB;
	}
	.introducename {
		.el-input-group__append {
			cursor: pointer;
			padding: 0px !important;
			.pointer {
				display: inline-block;
				width: 52px;
				height: 30px;
				text-align: center;
				line-height: 30px;
			}
			&:hover i {
				color: #409EFF;
			}
		}
		.el-input-group__prepend {
			background-color: #fff;
			color: #222;
		}
	}
	// 会员卡图标颜色
	.gary {
		color: #C1C1C1;
		font-weight: normal;
	}
	// 遮罩层
	.popupwarp {
		position: fixed;
		width: 100%;
		height: 100%;
		z-index: 9;
		background: rgba(0,0,0,0.3);
		top: 0;
		left: 0;
		display: none;
	}
	// 侧边栏
	.popup {
		position: absolute;
		right: 50%;
		top: 20%;
		margin-right: -275px;
		height: 400px;
		width: 610px;
		z-index: 9;
		background-color: #fff;
		border-radius: 5px;
		display: none;
		padding: 10px 30px 0px;
		.tips {
			margin: 15px;
		}
		.popup_tit {
			font-size: 16px;
			color: #333;
			padding: 10px;
			b {
				position: absolute;
				right: 10px;
				top: 10px;
				font-size: 20px;
				cursor: pointer;
				color: #909399;
				font-weight: lighter;
			}
			.poptite {
				position: absolute;
				left: 10px;
				top: 10px;
			}
		}
		.card_to .toCard_card {
			height: 40px;
			width: 90%;
    		margin-left: 5%;
			background-color: #eee;
			border-radius: 6px;
			display: table;
			.init_class {
				display: block;
				text-align: center;
				line-height: 40px;
				font-size: 14px;
			}
		}
		.card_to {
			padding: 15px 15px 0px;
			position: relative;
			.showcardlist {
				position: absolute;
				left: 78px;
				top: 52px;
				background: #fff;
				max-height: 300px;
				overflow-y: auto;
				width: 450px;
				box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.15);
    			border: 1px solid rgba(219,221,225,1);
				border-radius: 5px;
				ul {
					li {
						padding: 0px 10px;
						font-size: 12px !important;
					}
				}
			}
			.win_input {
				height: 32px;
				width: 454px !important;
				text-indent: 2px;
				.el-input-group__append {
					padding: 0px;
					&:hover i {
						color: #409eff;
					}
					span {
						display: inline-block;
						width: 50px;
						text-align: center;
						cursor: pointer;
					}
				}
				i {
					cursor: pointer;
				}
			}
		}
		.toCard_tit {
			font-size: 15px;
			color: #222222;
			padding: 25px 0 10px 15px;
		}
		.card_from {
			-webkit-box-sizing: border-box;
			border-bottom: none;
			overflow: hidden;
			font-size: 12px;
			padding: 20px 15px;
			line-height: 26px;
			background: #fafafa;
			margin: 20px 10px;
			.nolist {
				float: left;
				&:nth-child(odd) {
					width: 60%;
				}
				&:nth-child(even) {
					width: 40%;
					padding-left: 50px;
				}
			}
			.line_tit {
				color: #909090;
			}
		}
		.card_trans_total {
			margin: 10px 15px;
			overflow: hidden;
			.trans_fee {
				input {
					width: 100px;
					height: 32px;
					line-height: 32px;
					margin: 10px 10px 10px 0;
					border-radius: 5px;
					outline: none;
					border: 1px solid #D8DCE6;
					text-indent: 5px;
				}
			}
			.trans_pfee {
				input {
					width: 100px;
					height: 32px;
					line-height: 32px;
					margin: 10px 10px 10px 0;
					border-radius: 5px;
					outline: none;
					border: 1px solid #D8DCE6;
					text-indent: 5px;
				}
			}
		}
		.foot_btns {
			overflow: hidden;
			text-align: right;
			padding: 0px 20px;

		}
	}
	.chosecard {
			height: 200px;
			overflow-y: auto;
		li {
			height: 40px;
			line-height: 40px;
			&:hover {
				background-color: #fcfbfb;
				cursor: pointer;
			}
		}
	}
	.searchtext {
		width: 308px !important;
		input {
			border-right: none;
		    border-top-right-radius: 0px;
			border-bottom-right-radius: 0px;
		}
	}
	.searchList {
		position: absolute !important;
		button {
			border-left: none;
			margin: 1px 0px 0px -2px;
			border-top-left-radius: 0px;
			border-bottom-left-radius: 0px;
		}
	}
	.searchshow {
		position: fixed;
		top: 512px;
		left: 455px !important;
		width: 351px !important;
		padding: 15px 0px;
		max-height: 300px;
		overflow-y: auto;
	}
	.mdf {
		width: 320px !important;
	}
// 修改popover样式
.remarksbg {
	width: 400px !important;
	.el-form {
		width: 372px !important;
		.el-form-item {
			margin-bottom: 5px !important;
		}
	}
}
.disabled {
    pointer-events: none;
    cursor: default;
}
.moreOpera {
	color: #C1C1C1 !important;
}
.el-dropdown-menu__item:hover .moreOpera {
	color: #409EFF !important;
}
.el-dropdown-menu__item {
	padding: 2px 0px;
}
// 修改通用样式
.el-message {
	width: 420px !important;
}
.el-dropdown-menu .el-dropdown-menu__item .moreOpera:hover {
  	color: #409EFF
}
.arrear {
	.box-card {
		.el-card__body {
			padding: 10px 14px 16px !important;
		}
	}
	.el-table th:nth-of-type(4) {
		padding-left: 24px;
	}
	.el-table td:nth-of-type(4) {
		padding-left: 24px;
	}
	.el-table th:nth-of-type(5) {
		text-align: right;
	}
	.el-table td:nth-of-type(5) {
		text-align: right;
	}
}
.el-popper[x-placement^="bottom"] {
	margin-top: 2px !important;
	margin-bottom: 5px !important;
}
</style>
