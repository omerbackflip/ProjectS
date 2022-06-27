<template>
  <div class="main-container">
    <div
      v-bind:class="{
        'alert-danger': messageType === 'danger',
        'alert-success': messageType === 'success',
      }"
      class="alert m-4 mb-4"
      v-if="message"
    >
      {{ message }}
    </div>
    <template>
      <!-- <div v-if="showSearch" class="search-wrapper d-flex mr-3">
			<input v-model="keyword" class="form-control form-control-sm mt-2 mb-2 ml-4" type="text" placeholder="חפש מילים מסויימיות..." style="width:auto">
			<button @click="loadListItems" class="btn btn-success btn-sm mt-2 mb-2 ml-2">
				Search Global
			</button>
		</div> -->
      <template v-if="!isLoading && payableItems">
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="חיפוש מקומי דינמי"
            single-line
            hide-details
          ></v-text-field>
          <v-flex class="ml-4">
            <export-excel
              :data="payableItems"
              :fields="xlsHeders"
              type="xlsx"
              name="export"
              :title="search ? search : 'Header text'"
              footer="This is footer"
              class="mt-1"
            >
              <v-btn class="btn btn-danger">
                <v-icon>mdi-download</v-icon>Download To Excel
              </v-btn>
            </export-excel>
          </v-flex>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="payableItems"
          disable-pagination
          bordered
          height="84vh"
          fixed-header
          hide-default-footer
          :item-class="itemRowBackground"
          :search="search"
          dense
          item-key="itemId"
          :expanded.sync="expanded"
          show-expand
          :single-expand="true"
        >
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">

              <v-row class="input-wrapper">
				<v-col v-if="item.added" cols="3">
					<v-btn class="update-button" x-small @click="updateItem(item)">update</v-btn>
				</v-col>
                <v-col :cols="(item.added) ? '3' : '4'">
                  <v-text-field
                    label="Amount"
                    class=""
					@change="(e)=>!(item.added) ? addToList(item.itemId,e,'amount') : null"
					solo
                    v-model="item.amount"
                    autocomplete="off"
                  ></v-text-field>
                </v-col>

                <v-col :cols="(item.added) ? '3' : '4'">
                  <v-text-field
                    label="Remarks"
                    class=""
					solo
					@change="(e)=>!(item.added) ? addToList(item.itemId,e,'remarks') : null"
                    v-model="item.remarks"
                  ></v-text-field>
                </v-col>

                <v-col :cols="(item.added) ? '3' : '4'">
                  <v-text-field
                    label="Topic"
                    class=""
					solo
					@change="(e)=>!(item.added) ? addToList(item.itemId,e,'topic') : null"
                    v-model="item.topic"
                  ></v-text-field>
                </v-col>

              </v-row>
            </td>
          </template>

          <template v-slot:[`item.price`]="{ item }">
            {{ item.price ? item.price.toLocaleString() : "" }}
          </template>

          <template
            class="dir-rtl text-right"
            v-slot:[`item.description`]="{ item }"
          >
            {{ item.description }}
          </template>

          <template v-slot:[`item.add_to_paka`]="{ item }">
            <td v-if="!item.added && !(item.unit === 'הערה')">
              <input
                :checked="itemIds.includes(item.itemId)"
                v-if="item.itemId.length === 10"
                @change="addToList(item.itemId,'','remarks',true); handleExpansion(item)"
                style="text-align: center"
                type="checkbox"
                class="cursor-pointer"
              />
            </td>
            <td @click="handleExpansion(item)" v-else-if="item.added">
              <p v-if="item.itemId.length === 10">{{ item.amount }}</p>
            </td>
            <td v-else-if="item.unit === 'הערה' && !item.added">
              <p v-if="item.itemId.length === 10"></p>
            </td>
          </template>
        </v-data-table>
      </template>
    </template>

	<v-snackbar
      v-model="snackbar"
    >
      {{ snackBarText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          snackBarText
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <div
      style="position: static"
      v-if="!payableItems.length && !isLoading"
      class="mt-3 mb-4 text-center alert alert-warning container"
    >
      No Data has been imported!
    </div>

    <template v-if="isLoading">
      <md-progress-spinner></md-progress-spinner>
    </template>
  </div>
</template>

<script>
import {
  getAllPayableItems,
  addShortListItems,
  updateShortListItem,
} from "../api";
import { getUser } from "../data/utils";
import MainHeader from "./MainHeader.vue";
import Vue from "vue";
import excel from "vue-excel-export";
Vue.use(excel);

export default {
  name: "Payable-Items",
  components: {
    MainHeader,
  },
  data() {
    return {
      payableItems: [],
      // keyword:'',
      isLoading: false,
      file: "",
      showSearch: false,
      message: "",
      messageType: "danger",
      currentPage: 0,
      itemIds: [],
	  snackbar: false,
	  snackBarText: '',
      user: {},
      headers: [
        { text: "", value: "data-table-expand", class: "hdr-styles-payable" },
        { text: "ID", value: "itemId", class: "hdr-styles-payable" },
        {
          text: "DESCRIPTION",
          value: "description",
          class: "hdr-styles-payable",
          align: "right",
          rtl: true,
        },
        { text: "UNIT", value: "unit", class: "hdr-styles-payable" },
        {
          text: "PRICE",
          value: "price",
          class: "hdr-styles-payable",
          align: "right",
        },
        { text: "ADD", value: "add_to_paka", class: "text hdr-styles-payable" },
      ],
      search: "",
      xlsHeders: {
        ID: "itemId",
        תאור: "description",
        יחידה: "unit",
        מחיר: "price",
        כמות: "planned",
      },
      expanded: [],
    };
  },
  methods: {
    //load all payable items list
    async loadPayableItems(page, keyword) {
      // page contain Area+subArea e.g "04.01"
      try {
        this.isLoading = true;
        const params = {
          userName: this.user.userName,
        };
        if (page) {
          params["itemId"] = page;
          this.currentPage = page; // Save current page in order to stay in the current page
        } else if (keyword) {
          params["keyword"] = keyword;
        } else {
          params["itemId"] = "01";
        }
        const response = await getAllPayableItems(params);
        if (response.data) {
          this.payableItems = response.data.result;
          this.$emit("getData", response.data.idPrefixes);
        }
        this.isLoading = false;
      } catch (error) {
        console.log(error);
        this.isLoading = false;
      }
    },
    //used to add items to short list
    async addToShortList() {
      try {
        if (this.itemIds && this.itemIds.length) {
          const body = {
            userName: this.user.userName,
            itemIds: this.itemIds,
          };
          const response = await addShortListItems(body);
          if (response.data && !response.data.hasErrors) {
            this.message = response.data.message;
            this.messageType = "success";
            this.loadPayableItems(this.currentPage);
			this.itemIds.map(item => this.handleExpansion(item.id));
            setTimeout(() => (this.message = ""), 4000);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    //Background of row if added, area or sub area
    itemRowBackground(item) {
      return item.added
        ? "bg-green"
        : item.itemId.length === 2
        ? "area-wrapper"
        : item.itemId.length === 5
        ? "sub-area-wrapper"
        : "";
    },
    //Toggle main top search button function
    toggleSearch() {
      this.showSearch = !this.showSearch;
    },
    //to load this function when search keyword is entered
    // loadListItems(){
    // 	this.loadPayableItems(0,this.keyword);
    // },
    //add to short list function
    addToList(id,e,key,check) {
      //getting index if the item is already pushed in itemIds
      const index = this.itemIds.findIndex(item => item.id === id);
      //if not pushed, push it
      if (index < 0) {
        this.itemIds.push({ [key]: e, id });
      } else {
        //else remove it
		if(check) {
	        this.itemIds.splice(index, 1);
		} else {
			this.itemIds[index] = {...this.itemIds[index], [key]: e}
		}
      }
      this.$emit("getCheckedItems", this.itemIds);
    },
    getExtension(filename) {
      var i = filename.lastIndexOf(".");
      return i < 0 ? "" : filename.substr(i);
    },
    changeSize(e) {
      this.size = e.target.value;
      this.loadPayableItems();
    },
	handleExpansion(item) {
      const itemIndex = this.expanded.indexOf(item);
      itemIndex>=0 ? this.expanded.splice(itemIndex, 1) : this.expanded.push(item);
    },
	handleDataChange(id,key,e){
		this.itemPayloads[id] = {
			[key]: e,
		}
	},
    //used to update remark, topic or amount for short list item
    async updateItem(item) {
      try {
        const body = {};
        if (item) {
          body.itemId = item.itemId;
          body.userName = this.user.userName;
          body.amount = item.amount;
          body.topic = item.topic;
          body.remarks = item.remarks;
          const response = await updateShortListItem(body);
		  if(response) {
			this.snackbar = true;
			this.snackBarText = "Successfully updated item!";
			this.handleExpansion(item);
		  }
        }
      } catch (error) {
        console.log(error);
		this.snackbar = true;
		this.snackBarText = "Couln't upload the shortlist file!";
        this.showMessage("Couln't upload the shortlist file", "danger");
      }
    },
  },
  created() {
    const user = JSON.parse(getUser());
    this.user = user;
    this.loadPayableItems();
  },
};
</script>

<style>
.area-wrapper {
  border: 1px solid yellow;
  background: yellow !important;
}

.sub-area-wrapper {
  border: 1px solid blue;
  background: blue !important;
  color: #fff;
}

.hdr-styles-payable {
  background-color: green !important;
  font-size: 18px !important;
  font-weight: 600;
  color: #fff !important;
}

.md-cell {
  border-left: 1px solid #e0e0e0;
  padding-left: 10px;
}

.md-header-cell {
  border-left: 1px solid #e0e0e0;
  padding-left: 10px;
}

.md-column-description {
  max-width: 200px;
  text-align: right !important;
}

.filters-container {
  background: #ececec;
  border-radius: 12px;
  float: right;
  width: 70%;
  padding: 15px 30px 15px 30px;
}

.add-item {
  width: 160px;
  text-align: center;
}

.checkbox-item {
  text-align: center;
}

.align-button {
  text-align-last: right;
}

td {
  text-align: center;
  /* text-align: -webkit-left; */
}

.page-select {
  width: 23% !important;
}

.item-wrapper {
  border: 1px solid #ececec;
  padding: 5px;
  font-size: 10px;
}

.item-decoration {
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 4px;
  color: black;
}
.bg-yellow {
  color: yellow !important;
}

.bg-blue {
  color: blue !important;
}
.bg-green {
  background-color: lightgreen !important;
}

tr :nth-child(1) {
  direction: rtl !important;
}

.v-data-table__wrapper {
  overflow-x: hidden !important;
}

.text-right {
  direction: rtl !important;
}

.v-card__title {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.v-input {
  padding-top: 0px !important;
}

.v-data-table__expand-icon:before {
  content: "\2039" !important;
  transform: rotate(90deg);
  width: 20px;
  height: 20px;
}

.input-expand {
  border: 1px solid #666262;
  border-radius: 5px;
  padding: 5px 0px 5px 4px;
  margin: 8px 12px 8px 20px;
}
.input-wrapper {
  width: fit-content !important;
  float: left !important;
  margin-top: 10px !important;
}

.update-button{
	border: 1px solid blue !important;
    padding: 22px 36px 22px 36px !important;
    margin-top: 0px !important;
}
</style>