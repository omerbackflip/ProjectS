<template>
<div aria-label="Paging">
	<div v-if="totalPages > 1" class="paging-wrapper">
		<div>
			<button md-raised-button
					class="button-page btn"
					:disabled="pageNumber === 1"
					@click="onPageChange(pageNumber - 1)">
				Previous
			</button>
		</div>
		<div :key="page" v-for="page of totalPagesArray">
			<button md-raised-button
					class="button-page btn"
					v-if="!isValidPage(pageDistance+1, page)"
					:disabled="page === pageNumber"
					@click="isValidPage(pageDistance, page) ? '' : onPageChange(page)">
				{{isValidPage(pageDistance, page) ? '...' : page}}
			</button>
		</div>
		<div>
			<button md-raised-button
					class="button-page btn"
					:disabled="pageNumber === totalPages"
					@click="onPageChange(pageNumber + 1)">
				Next
			</button>
		</div>
	</div>
</div>

</template>

<script>

export default {
	name: 'Paging',
	props: {
        totalCount : Number,
        pageLength : Number,
        pageNumber : Number,
        totalPages : Number,
    },
	data(){
		return{
			totalPagesArray :[],
	        pageDistance :5,
		}
	},
	methods: {
        isValidPage(distance, page) {
            return (this.pageNumber - distance > page || this.pageNumber + distance < page) && (page !== 1 && page !== this.totalPages);
        },
        onPageChange(pageNumber) {
            this.$emit("pageChangeEvent",pageNumber);
        }
	},
	created(){
		for (let i = 0; i < this.totalPages; i++) {
			this.totalPagesArray.push(i + 1);
		}
	}
}
</script>

<style scoped>
.active {
	background-color: red;
}

.paging-wrapper{
    display: flex;
    flex-direction: row;
    margin-top: 15px;
}

.button-page{
	min-width: unset;
    color: #696cff;
    margin: 5px;
    border: 1px solid;
    padding: 0px 12px 0px 12px;
}
</style>