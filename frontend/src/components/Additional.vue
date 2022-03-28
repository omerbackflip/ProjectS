<template>
    <v-dialog max-width="600px">
        <template v-slot:activator="{on,attrs}">
            <v-btn class="mx-4 dark" v-bind="attrs" v-on="on">Additionals</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <h2>Additionals</h2>
            </v-card-title>
        </v-card>
    </v-dialog>
</template>

<script>
export default {

}
</script>
