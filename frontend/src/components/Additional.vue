<template>
    <v-dialog max-width="600px">
        <template v-slot:activator="{on,attrs}">
            <v-btn class="mx-4 dark" v-bind="attrs" v-on="on">Additionals</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <h2>Additionals</h2>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="additionalList">

                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>


<script>
import { 
    getAdditionals,
} from '../api';

export default {
    props:[
        'userName',
    ],
	data() {
		return {
            additionalList: [],
			headers:[
				{text:'סעיף', 			value:'itemId', 	class: 'hdr-styles'},
				{text:'תאור הסעיף', 	value:'description',class: 'hdr-styles', align:'right'},
                {text:'סה"כ',			value:'total', 		class: 'hdr-styles', align:'right'},
			],
        }
	},
    methods : {
        async loadadditionals(additional) {
            try {
                this.isLoading = true;
                const params = {
                    additional: "99",
                    userName: this.userName,
                };
                const response = await getAdditionals(params);
                if (response.data) {
                    this.additionalList = response.data.result;
                }
            } catch (error) {
                console.log(error);
                this.isLoading = false;
            }
        },
    },

    created(){
		this.loadadditionals();
	}
}
</script>
