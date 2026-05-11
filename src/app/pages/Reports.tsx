import {
  FileText,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileDown,
  TrendingUp,
  Users,
  FolderKanban,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const reportTemplates = [
  {
    id: 1,
    name: 'Rapport Staffing Mensuel',
    description: 'Vue consolidée du taux de staffing et anomalies',
    icon: Users,
    color: '#7B61FF',
    format: 'Excel',
  },
  {
    id: 2,
    name: 'Rapport Projets',
    description: 'Performance et avancement des projets',
    icon: FolderKanban,
    color: '#2D9CDB',
    format: 'PDF',
  },
  {
    id: 3,
    name: 'Analyse Conflits',
    description: 'Détection et résolution des conflits',
    icon: TrendingUp,
    color: '#F59E0B',
    format: 'Excel',
  },
  {
    id: 4,
    name: 'Export Ressources',
    description: 'Liste complète des collaborateurs et utilisation',
    icon: FileSpreadsheet,
    color: '#10B981',
    format: 'Excel',
  },
];

const recentReports = [
  {
    id: 1,
    name: 'Staffing_Mars_2026.xlsx',
    type: 'Staffing Mensuel',
    date: '2026-04-01',
    size: '2.4 MB',
    user: 'Marie Dubois',
  },
  {
    id: 2,
    name: 'Projets_Q1_2026.pdf',
    type: 'Rapport Projets',
    date: '2026-04-05',
    size: '1.8 MB',
    user: 'Pierre Laurent',
  },
  {
    id: 3,
    name: 'Conflits_Avril_2026.xlsx',
    type: 'Analyse Conflits',
    date: '2026-04-09',
    size: '1.2 MB',
    user: 'Marie Dubois',
  },
];

export function Reports() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2937]">
            Rapports & Exportations
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Générez et téléchargez vos rapports consolidés
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {reportTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg p-6 border border-[#E5E7EB] hover:border-[#7B61FF] transition-all hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${template.color}15` }}
              >
                <template.icon
                  className="w-7 h-7"
                  style={{ color: template.color }}
                />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-[#F5F7FA] text-gray-600 rounded">
                {template.format}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <button
              className="w-full py-2.5 bg-[#7B61FF] text-white rounded-lg text-sm font-medium hover:bg-[#6B51EF] transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: template.color }}
            >
              <Download className="w-4 h-4" />
              Générer le rapport
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB]">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1F2937]">
              Rapports Récents
            </h2>
            <div className="flex items-center gap-3">
              <Select defaultValue="7">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">90 derniers jours</SelectItem>
                </SelectContent>
              </Select>
              <button className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F5F7FA] transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F7FA]">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                  Nom du fichier
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                  Date de création
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                  Taille
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                  Créé par
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-[#F5F7FA]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {report.name.endsWith('.xlsx') ? (
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-[#1F2937]">
                        {report.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{report.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(report.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{report.size}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{report.user}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                      <FileDown className="w-4 h-4 text-gray-600 group-hover:text-[#7B61FF]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#7B61FF]/10 to-[#2D9CDB]/10 rounded-lg p-6 border border-[#7B61FF]/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
              Export Consolidé Personnalisé
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Créez un rapport sur mesure en sélectionnant les données et la
              période de votre choix
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Données à inclure
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Ressources et utilisation
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Projets et avancement
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Conflits et anomalies
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded" />
                    Données financières
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <Select defaultValue="month">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="quarter">Ce trimestre</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Format
                </label>
                <Select defaultValue="xlsx">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-[#7B61FF] text-white rounded-lg text-sm font-medium hover:bg-[#6B51EF] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Générer l'export personnalisé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
