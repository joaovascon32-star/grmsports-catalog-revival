import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { X, Ruler, AlertCircle, Check } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useStore();
  const [modelType, setModelType] = useState<'torcedor' | 'jogador'>('torcedor');

  if (!isSizeGuideOpen) return null;

  const torcedorSizes = [
    { size: 'P', width: '50 - 52 cm', length: '70 - 72 cm', height: '1,65m - 1,72m', weight: '60 - 70 kg' },
    { size: 'M', width: '53 - 55 cm', length: '73 - 75 cm', height: '1,73m - 1,78m', weight: '70 - 80 kg' },
    { size: 'G', width: '56 - 58 cm', length: '76 - 78 cm', height: '1,79m - 1,85m', weight: '80 - 90 kg' },
    { size: 'GG', width: '59 - 61 cm', length: '79 - 81 cm', height: '1,86m - 1,92m', weight: '90 - 100 kg' },
    { size: 'XGG', width: '62 - 64 cm', length: '82 - 84 cm', height: '1,90m - 1,96m', weight: '100 - 110 kg' },
    { size: '2XGG', width: '65 - 67 cm', length: '85 - 87 cm', height: 'Acima de 1,92m', weight: 'Acima de 110 kg' },
  ];

  const jogadorSizes = [
    { size: 'P', width: '47 - 49 cm', length: '68 - 70 cm', height: '1,65m - 1,70m', weight: '55 - 65 kg' },
    { size: 'M', width: '50 - 52 cm', length: '71 - 73 cm', height: '1,70m - 1,76m', weight: '65 - 75 kg' },
    { size: 'G', width: '53 - 55 cm', length: '74 - 76 cm', height: '1,77m - 1,82m', weight: '75 - 85 kg' },
    { size: 'GG', width: '56 - 58 cm', length: '77 - 79 cm', height: '1,83m - 1,88m', weight: '85 - 95 kg' },
    { size: 'XGG', width: '59 - 61 cm', length: '80 - 82 cm', height: '1,89m - 1,94m', weight: '95 - 105 kg' },
  ];

  const activeTable = modelType === 'torcedor' ? torcedorSizes : jogadorSizes;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-secondary backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-secondary border border-border rounded-lg  overflow-hidden my-auto text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-secondary">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-foreground" />
            <div>
              <h2 className="text-base font-bold text-foreground uppercase ">
                Tabela Oficial de Medidas
              </h2>
              <p className="text-xs text-foreground">Dimensões em centímetros e recomendações de biotipo</p>
            </div>
          </div>
          <Button variant="ghost"
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent text-foreground hover:text-primary transition-colors"
            aria-label="Fechar tabela"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab switch between Torcedor vs Jogador */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 p-1 bg-secondary rounded-md border border-border">
            <Button variant="ghost"
              onClick={() => setModelType('torcedor')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                modelType === 'torcedor'
                  ? 'bg-secondary text-foreground '
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Versão Torcedor (Padrão Confortável)
            </Button>
            <Button variant="ghost"
              onClick={() => setModelType('jogador')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                modelType === 'jogador'
                  ? 'bg-secondary text-foreground '
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Versão Jogador (Slim Fit / Ajustada)
            </Button>
          </div>

          {/* Alert tip for player version */}
          {modelType === 'jogador' && (
            <div className="p-3 rounded-lg bg-secondary border border-border text-foreground text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> A Versão Jogador possui modelagem atlética colada ao corpo. Se você prefere um caimento mais solto, sugerimos pedir <strong>um tamanho maior</strong> do que costuma vestir.
              </span>
            </div>
          )}

          {/* Measurements Table */}
          <div className="border border-border rounded-md overflow-hidden bg-secondary">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary border-b border-border text-foreground uppercase font-sans text-xs">
                <tr>
                  <th className="py-2.5 px-3">Tamanho</th>
                  <th className="py-2.5 px-3">Largura (Tórax)</th>
                  <th className="py-2.5 px-3">Comprimento</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Altura Aprox.</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Peso Aprox.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeTable.map((row) => (
                  <tr key={row.size} className="hover:bg-accent transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-foreground">{row.size}</td>
                    <td className="py-2.5 px-3 font-sans text-foreground">{row.width}</td>
                    <td className="py-2.5 px-3 font-sans text-foreground">{row.length}</td>
                    <td className="py-2.5 px-3 text-foreground hidden sm:table-cell">{row.height}</td>
                    <td className="py-2.5 px-3 text-foreground hidden sm:table-cell">{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measuring tip */}
          <div className="text-xs text-foreground leading-relaxed bg-secondary p-3.5 rounded-md border border-border">
            <h4 className="font-bold text-foreground mb-1">Como medir seu manto ideal?</h4>
            <p>
              Estique uma camisa que você já gosta de vestir sobre uma superfície plana. Meça a largura de uma axila à outra (Tórax) e o comprimento do ombro até a barra inferior.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-secondary flex justify-end">
          <Button variant="ghost"
            onClick={() => setIsSizeGuideOpen(false)}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-accent text-xs font-semibold text-foreground transition-colors"
          >
            Entendi, fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
