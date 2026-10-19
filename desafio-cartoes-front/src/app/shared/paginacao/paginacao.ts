import { Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'app-paginacao',
  templateUrl: './paginacao.html',
})
export class Paginacao {
  readonly total = input.required<number>();
  readonly tamanho = input(10);
  readonly pagina = model(1);

  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanho())));
  protected readonly paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  protected ir(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.pagina.set(pagina);
    }
  }
}
