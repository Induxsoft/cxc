var documento =
{
    tableId: "", table: null,

    init()
    {
        if (this.tableId.trim() != "") { this.table = document.getElementById(this.tableId); }
    },

    trigger(element,event) {
        if (element) {
            let e = new Event(event);
            element.dispatchEvent(e);
        }
    },

    round(num, dec=2) {
        var signo = (num >= 0 ? 1 : -1);
        num = num * signo;
        if (dec === 0) return signo * Math.round(num);
        num = num.toString().split('e');
        num = Math.round(+(num[0] + 'e' + (num[1] ? (+num[1] + dec) : dec)));
        num = num.toString().split('e');
        return signo * (num[0] + 'e' + (num[1] ? (+num[1] - dec) : -dec));
    },

    goTo(url) {
        if (!url) { alert("No se ha indicado un destino."); return; }
        if (!this.table) { alert("No se encontro una definición de tabla (edit-table)."); return; }
        if (this.table.CurrentRowIndex() < 0) { alert("Debe seleccionar una fila"); return; }

        var data = this.table.DataArray[this.table.CurrentRowIndex()];
        window.location.href = url.replace("{_documento}",data.sys_pk);
    },

    getCurrentContext()
    {
        const id = (this.table?.DataArray[this.table.CurrentRowIndex()]?.sys_pk ?? "");
        return { item_id:id, context: {} }
    },

    list: {},

    form: {},

    crear: {
        form: null,
        elements: null,
        btnSave: null,

        init()
        {
            this.form = document.getElementById("form_cxc");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { documento.trigger(this.form,"submit") }); }
            if (this.form) {
                this.elements = this.form.elements;

                let ik_cliente = document.getElementById("sel_cliente");
                ik_cliente.addEventListener("change",function(data) {
                    let txt_divisa = document.getElementById("txt_divisa");
                    let txt_tcambio = document.getElementById("txt_tcambio");

                    txt_divisa.value = data.divisa;
                    txt_tcambio.value = data.tcambio;
                });
            }
        },
    },

    cobro: {
        formCobro: null,
        elements: null,
        btnSave: null,
        dtCxC: {},
        dvsPred: {},

        init()
        {
            this.formCobro = document.getElementById("form_cobro");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { documento.trigger(this.formCobro,"submit") }); }
            if (this.formCobro) {
                this.elements = this.formCobro.elements;

                this.elements["txt_importe"].addEventListener("input", (event) => {
                    let importe = Number(event.target.value);
                    let saldo = Number(this.dtCxC.saldo);

                    this.elements["txt_nuevo_saldo"].value = Math.sub(saldo,importe);
                });

                this.elements["sel_cuenta_deposito"].addEventListener("change", (event) => {
                    let option = event.target.options[event.target.selectedIndex];
                    let codigo = option.getAttribute("data-divisa").toUpperCase();
                    let cambio = Number(option.getAttribute("data-tcambio"));

                    this.pedirTCambio();

                    this.elements["txt_tcambio_deposito"].value = cambio;
                    documento.trigger(this.elements["txt_tcambio_deposito"],"change");
                });
                
                this.elements["txt_tcambio_deposito"].addEventListener("change", (event) => {
                    let tcambio_dep = Number(event.target.value);
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    
                    let importe_cte = Number(this.elements["txt_importe"].value);
                    let importe_dep = Math.mul(importe_cte,tcambio_cte);
                    importe_dep = Math.div(importe_dep,tcambio_dep);
                    
                    this.elements["txt_importe_deposito"].value = importe_dep;
                });
                this.elements["txt_importe_deposito"].addEventListener("change", (event) => {
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    let tcambio_dep = Number(this.elements["txt_tcambio_deposito"].value);
                    
                    let importe_dep = Number(event.target.value);
                    let importe_cte = Math.mul(importe_dep,tcambio_dep);
                    importe_cte = Math.div(importe_cte,tcambio_cte);

                    this.elements["txt_importe"].value = importe_cte;
                    documento.trigger(this.elements["txt_importe"],"input");
                });

                this.elements["txt_importe"].addEventListener("change", (event) => {
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    let tcambio_dep = Number(this.elements["txt_tcambio_deposito"].value);
                    
                    let importe_cte = Number(event.target.value);
                    let importe_dep = Math.mul(importe_cte,tcambio_cte);
                    importe_dep = Math.div(importe_dep,tcambio_dep);

                    this.elements["txt_importe_deposito"].value = importe_dep;
                });
            }
        },

        pedirTCambio(){
            let optCtaR = this.elements["sel_cuenta_deposito"].options[this.elements["sel_cuenta_deposito"].selectedIndex];
            let cDvsPred = (this.dvsPred.codigo).toUpperCase();
            let cDvsProv = (this.dtCxC.divisa).toUpperCase();
            let cDvsCtaR = optCtaR.getAttribute("data-divisa").toUpperCase();

            let hide_tcambio_dep = false;
            let hide_importe_dep = false;
            let hide_tcambio_cte = false;

            let div_tcambio_cte = document.getElementById("div_tcambio");
            let txt_tcambio_cte = document.getElementById("txt_tcambio");
            let txt_importe_cte = document.getElementById("txt_importe");

            let div_tcambio_dep = document.getElementById("div_tcambio_deposito");
            let div_importe_dep = document.getElementById("div_importe_deposito");
            let txt_tcambio_dep = document.getElementById("txt_tcambio_deposito");
            let spn_tcambio_dep = document.getElementById("spn_tcambio_deposito");
            let txt_importe_dep = document.getElementById("txt_importe_deposito");
            let spn_importe_dep = document.getElementById("spn_importe_deposito");

            if (cDvsPred == cDvsProv && cDvsPred == cDvsCtaR)
            {
                txt_tcambio_cte.value = 1;
                txt_tcambio_dep.value = 1;

                hide_tcambio_cte = true;
                hide_tcambio_dep = true;
                hide_importe_dep = true;
            }
            else if (cDvsPred != cDvsProv && cDvsProv == cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtProv.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = (tcambio_cte <= 0) ? Number(this.dtProv.tcambio) : tcambio_cte;

                hide_tcambio_dep = true;
                hide_importe_dep = true;
            }
            else if (cDvsPred == cDvsProv && cDvsPred != cDvsCtaR)
            {
                let tcambio_dep = Number(txt_tcambio_dep.value);

                txt_tcambio_cte.value = 1;
                txt_tcambio_dep.value = (tcambio_dep <= 0) ? Number(optCtaR.getAttribute("data-tcambio")) : tcambio_dep;
                
                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;

                hide_tcambio_cte = true;
            }
            else if (cDvsPred != cDvsProv && cDvsPred == cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtProv.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = 1;

                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;

                hide_tcambio_dep = true;
            }
            else if (cDvsPred != cDvsProv && cDvsPred != cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);
                let tcambio_dep = Number(txt_tcambio_dep.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtProv.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = (tcambio_dep <= 0) ? Number(optCtaR.getAttribute("data-tcambio")) : tcambio_dep;
                
                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;
            }

            txt_importe_cte.value = Number(txt_importe_cte.value);
            txt_importe_dep.value = Number(txt_importe_dep.value);

            div_tcambio_dep.classList.toggle("d-none",hide_tcambio_dep);
            div_importe_dep.classList.toggle("d-none",hide_importe_dep);
            div_tcambio_cte.classList.toggle("d-none",hide_tcambio_cte);
        },
    },

    bonificacion: {
        formBonificacion: null,
        elements: null,
        btnSave: null,
        dtCxC: {},
        dvsPred: {},

        init()
        {
            this.formBonificacion = document.getElementById("form_bonificacion");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { documento.trigger(this.formBonificacion,"submit") }); }
            if (this.formBonificacion) {
                this.elements = this.formBonificacion.elements;

                this.elements["txt_importe"].addEventListener("input", (event) => {
                    let importe = Number(event.target.value);
                    let saldo = Number(this.dtCxC.saldo);

                    this.elements["txt_nuevo_saldo"].value = Math.sub(saldo,importe);
                });
            }
        },
    },

    intmor: {
        formIntMor: null,
        elements: null,
        btnSave: null,
        dtCxC: {},
        dvsPred: {},

        init()
        {
            this.formIntMor = document.getElementById("form_intmor");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { documento.trigger(this.formIntMor,"submit") }); }
            if (this.formIntMor) {
                this.elements = this.formIntMor.elements;

                this.elements["txt_importe"].addEventListener("input", (event) => {
                    let importe = Number(event.target.value);
                    let saldo = Number(this.dtCxC.saldo);

                    this.elements["txt_nuevo_saldo"].value = Math.add(saldo,importe);
                });
            }
        },
    },

    aplicar: {
        tbl_xaplicar:null, arr_xaplicar:[], tbl_aplicados:null, arr_aplicados:[],
        source:{},

        init()
        {
            this.tbl_xaplicar = document.getElementById("tbl_xaplicar");
            this.tbl_aplicados = document.getElementById("tbl_aplicados");
            const btn_aplicar = document.getElementById("btn_aplicar");
            const btn_desaplicar = document.getElementById("btn_desaplicar");

            btn_aplicar.addEventListener("click", (e) => this.aplicar());
            btn_desaplicar.addEventListener("click", (e) => this.desaplicar());

            this.setTableEvents();
        },

        setTableEvents()
        {
            if (this.tbl_xaplicar)
            {
                let table = this.tbl_xaplicar;
                let events = table.EdiTable.Const.Events;
                this.arr_xaplicar = table?.DataArray ?? [];

                table.AutoAddRow = false;

                table.Events[events.BeforeUpdateCell] = (e) => this.validarImportes(e);
                table.Events[events.ConfirmEdition] = (e) => this.actualizarImportes(e);
            }
            
            if (this.tbl_aplicados)
            {
                let table = this.tbl_aplicados;
                let events = table.EdiTable.Const.Events;
                this.arr_aplicados = table?.DataArray ?? [];

                table.AutoAddRow = false;
            }
        },

        submit(endpoint, data, callback=null)
        {
            // Opciones de la petición
            const options =
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            };

            // Hacer la petición
            fetch(endpoint, options).then((response) => response.json())
            .then((res) => {
                // Manejar la respuesta del servidor
                if (res.message) {
                    alert(res.message);
                    return;
                }

                if (callback) callback(res);
                else console.log(res);
            })
            .catch((err) => {
                // Manejar el error
                alert(err.message);
            });
        },

        aplicar()
        {
            let arr_xaplicar = this.tbl_xaplicar.DataArray;
            
            let lista = [];
            for (let i = 0; i < arr_xaplicar.length; i++) {
                const doc = arr_xaplicar[i];
                let aplicar = Number(doc.aplicar);
                
                if (aplicar <= 0) continue;

                let destino =
                {
                    id_origen: this.source.sys_pk,
                    id_destino: doc.sys_pk,
                    aplicar: aplicar
                }

                lista.push(destino);
            }
            
            if (lista.length === 0) return;
            let data = { aplicacion: lista }

            this.submit("./?_act=aplicar", data, function(res){ window.location.reload() });
        },

        desaplicar()
        {
            let arr_aplicados = this.tbl_aplicados.DataArray;

            if (arr_aplicados.length === 0) return;
            if (!confirm("¿Esta seguro que quiere desaplicar todos los documentos?\r\n(No se desaplican documentos que tengan un cfdi relacionado).")) return;

            this.submit("./?_act=desaplicar", {}, function(res){ window.location.reload() });
        },

        importesAplicar(e)
        {
            let cur_row = e.sender.RowIndexOfTd(e.td);
            let arr_xaplicar = this.tbl_xaplicar.DataArray;
                        
            let saplicado = this.source.aplicado;
            let sxaplicar = this.source.xaplicar;

            let saldo = Number(e.sender.DataArray[cur_row]["saldo"]);
            let aplicar = Number(e.text.trim());
            let sfinal = (saldo - aplicar);

            let aplicado = 0;
            for (let i = 0; i < arr_xaplicar.length; i++) {
                const impAplicar = Number(arr_xaplicar[i]["aplicar"]);
                aplicado = Math.add(aplicado,impAplicar);
            }
            aplicado = Math.add(aplicado,aplicar);

            let rst = 
            {
                aplicar: aplicar,
                sfinal: sfinal,
                aplicado: aplicado,
                xaplicar: Math.sub(sxaplicar,aplicado),
            }

            return rst
        },

        validarImportes(e)
        {
            if (e.coldef.field === "aplicar")
            {
                let rst = this.importesAplicar(e);

                if (rst.aplicar < 0) {
                    alert("El importe a aplicar no puede ser menor a 0.");
                    e.cancel = true;
                    return;
                }

                if (rst.sfinal < 0) {
                    alert("El importe a aplicar no puede ser mayor al saldo del documento.");
                    e.cancel = true;
                    return;
                }

                if (rst.xaplicar < 0) {
                    alert("El importes aplicado no puede superar al saldo disponible para aplicar.");
                    e.cancel = true;
                    return;
                }
            }
        },

        actualizarImportes(e)
        {
            let cur_row = e.sender.RowIndexOfTd(e.td);
                        
            if (e.coldef.field === "aplicar")
            {
                let lbl_saldo = document.getElementById("lbl_saldo");
                let lbl_aplicado = document.getElementById("lbl_aplicado");
                let lbl_xaplicar = document.getElementById("lbl_xaplicar");

                let rst = this.importesAplicar(e);

                e.sender.DataArray[cur_row]["aplicar"] = rst.aplicar;
                e.sender.DataArray[cur_row]["sfinal"] = rst.sfinal;
                e.sender.UpdateRow(cur_row);

                let langcode = (new Intl.NumberFormat()).resolvedOptions().locale;
                const formatter = new Intl.NumberFormat(langcode, {
                    style: "currency",
                    currency: "MXN",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                lbl_aplicado.textContent = formatter.format(rst.aplicado);
                lbl_xaplicar.textContent = formatter.format(rst.xaplicar);
            }
        },
    }
}