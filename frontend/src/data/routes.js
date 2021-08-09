export const routes = [
    {
        title: 'Payable Items',
        icon: 'payment',
        children: [{
            title: "List",
            path: '/payable-items-list',
            action: null
        },{
            title: "Import",
            path: null,
            action: 'import payable items',
        },{
            title: "Delete",
            path: null,
            action: 'delete payable items',
        }]
    },
    {
        title: 'Short Listed Items',
        icon: 'list_alt',
        children: [{
            title: "List",
            path: '/short-listed-items',
            action: null,
        },{
            title: "Import",
            path: null,
            action: 'import short listed items',
        },{
            title: "Export",
            path: null,
            action: 'export short listed items',
        },{
            title: "Delete",
            path: null,
            action: 'delete short listed items',
        },{
            title: "Copy",
            path: null,
            action: 'copy short listed items',
        }]
    },
    {
        title: 'Users',
        icon: 'person',
        path: '/users',
        children: []
    },
    {
        title: 'Summary',
        icon: 'money',
        path: '/summary',
        children: []
    },
]