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
        window.location.href = url.replace("@doc",data.sys_pk);
    },

    list: {},

    form: {},

    crear: {
        formcxp: null,
        elements: null,
        btnSave: null,

        init()
        {
            this.formcxp = document.getElementById("form_cxp");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
            if (this.formcxp) {
                this.elements = this.formcxp.elements;

                let ik_proveedor = document.getElementById("sel_proveedor");
                ik_proveedor.addEventListener("change",function(data) {
                    let txt_divisa = document.getElementById("txt_divisa");
                    let txt_tcambio = document.getElementById("txt_tcambio");

                    txt_divisa.value = data.divisa;
                    txt_tcambio.value = data.tcambio;
                });
            }
        },

        saveForm(){
            if (!this.formcxp.reportValidity()) return;
            this.formcxp.submit();
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
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
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

        saveForm(){
            if (!this.formCobro.reportValidity()) return;
            this.formCobro.submit();
        },
    },

    bonificacion: {
        formBonificacionCXP: null,
        elements: null,
        btnSave: null,
        dtCxC: {},
        dvsPred: {},

        init()
        {
            this.formBonificacionCXP = document.getElementById("form_bonificacion_cxp");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
            if (this.formBonificacionCXP) {
                this.elements = this.formBonificacionCXP.elements;

                this.elements["txt_importe"].addEventListener("input", (event) => {
                    let importe = Number(event.target.value);
                    let saldo = Number(this.dtCxC.saldo);

                    this.elements["txt_nuevo_saldo"].value = Math.sub(saldo,importe);
                });
            }
        },

        saveForm(){
            if (!this.formBonificacionCXP.reportValidity()) return;
            this.formBonificacionCXP.submit();
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
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
            if (this.formIntMor) {
                this.elements = this.formIntMor.elements;

                this.elements["txt_importe"].addEventListener("input", (event) => {
                    let importe = Number(event.target.value);
                    let saldo = Number(this.dtCxC.saldo);

                    this.elements["txt_nuevo_saldo"].value = Math.add(saldo,importe);
                });
            }
        },

        saveForm(){
            if (!this.formIntMor.reportValidity()) return;
            this.formIntMor.submit();
        },
    },
}