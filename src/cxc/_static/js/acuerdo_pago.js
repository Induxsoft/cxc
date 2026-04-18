var acuerdo = {

    init()
    {
        const idoc = document.getElementById('idoc');
        const monto_acuerdo = document.getElementById('monto_acuerdo');

        idoc.change_event = (data) => {
            this.renderIDocInfo(idoc);
            
            if (data?.saldo) monto_acuerdo.setAttribute('max',data.saldo);
            else monto_acuerdo.removeAttribute('max');
        };

        idoc.change_event(idoc.getValue());
    },

    renderIDocInfo(input)
    {
        const headings = '<th>' + input.colcaptions.replaceAll(',','</th><th>') + '</th>';
        const data = input.getValue() ?? {};
        let row = "";
        
        for (const col of input.columns.split(',')) {
            row += `<td>${data[col]??""}</td>`;
        }

        const table = `
        <table class="table table-sm table-borderless">
            <thead>
                <tr>${headings}</tr>
            </thead>
            <tbody>
                <tr>${row}</tr>
            </tbody>
        </table>
        `;

        const container = document.getElementById('document-info');
        container.innerHTML = table;
    },
}

document.addEventListener('DOMContentLoaded', () => { acuerdo.init() });