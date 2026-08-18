var grupo = {
    table_id:"",
    table:null,

    init() {
        this.table = document.getElementById(this.table_id);
        this.setTableEvents()
    },

    setTableEvents() {
        if (!this.table) return;

        const cliente = document.getElementById("cliente");
        const add_row = document.getElementById('btn-add-row');
        const del_row = document.getElementById('btn-del-row');

        add_row.addEventListener('click', () => this.table.AddRow());
        del_row.addEventListener('click', () => this.table.DeleteCurrentRow());
        this.table.setInputKey("codigo",cliente);
        this.table.setInputKey("nombre",cliente);
        cliente.change_event = (data) => this.addCustomer(data);

        this.table.Events['rowdeleted'] = function(e) {
            grupo.setDetail();
        }
        this.table.Events['fieldupdated'] = function(e) {
            grupo.setDetail();
        }
    },

    addCustomer(data) {
        let isnew = (!data.iclientes);
        let c = {
            sys_pk: (data.iclientes) ? data.sys_pk : 0,
            sys_recver: (data.iclientes) ? data.sys_recver : 0,
            iclientes: data.iclientes ?? data.sys_pk,
            codigo: data.codigo,
            nombre: data.nombre,
            tipo: data.tipo ?? ""
        }

        let index = this.table.CurrentRowIndex();
        this.table.DataArray[index] = c;
        this.table.UpdateRow(index);
        this.setDetail();
    },

    filterData() {
        return (this.table?.DataArray??[]).filter((row) => { return (row?.iclientes??0) > 0 });
    },

    setDetail() {
        const input = document.querySelector('input[name="clientes"]');
        input.value = JSON.stringify(this.filterData());
    }
}