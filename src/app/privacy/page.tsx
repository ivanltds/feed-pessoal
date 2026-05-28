export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Política de Privacidade</h1>
      <p className="text-sm text-neutral-500 mb-8">Última atualização: maio de 2026</p>

      <div className="prose prose-sm text-neutral-700 space-y-6">

        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">1. Quem somos</h2>
          <p>
            O <strong>Feed Pessoal</strong> é um serviço de curadoria de notícias personalizado.
            Coletamos apenas os dados necessários para entregar sua edição diária e melhorar sua experiência.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">2. Dados que coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Nome e e-mail</strong> — fornecidos por você no cadastro, usados para identificação e envio da edição diária.</li>
            <li><strong>Preferências de tópicos e horário</strong> — usadas para personalizar o conteúdo.</li>
            <li><strong>Interações com o feed</strong> — como tempo de leitura e cliques, usados exclusivamente para melhorar a curadoria.</li>
            <li><strong>Cookie de sessão</strong> — armazena um identificador anônimo para manter você conectado.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">3. Como usamos seus dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Personalizar e entregar sua edição diária de notícias.</li>
            <li>Melhorar o algoritmo de curadoria com base no seu comportamento de leitura.</li>
            <li>Enviar sua edição por e-mail no horário escolhido.</li>
          </ul>
          <p className="mt-2">Não vendemos, compartilhamos ou usamos seus dados para publicidade.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">4. Cookies</h2>
          <p>
            Usamos um único cookie essencial (<code>userId</code>) para identificar sua sessão. Sem ele,
            o serviço não funciona. Não usamos cookies de rastreamento ou de terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">5. Seus direitos (LGPD)</h2>
          <p>De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Acessar os dados que temos sobre você.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão dos seus dados.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
          </ul>
          <p className="mt-2">
            Para exercer esses direitos, entre em contato pelo e-mail{' '}
            <a href="mailto:ivanltds@gmail.com" className="text-blue-600 hover:underline">ivanltds@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">6. Retenção de dados</h2>
          <p>
            Seus dados são mantidos enquanto você tiver uma conta ativa. Ao solicitar exclusão,
            removemos todos os dados em até 30 dias.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">7. Contato</h2>
          <p>
            Dúvidas sobre privacidade? Fale conosco:{' '}
            <a href="mailto:ivanltds@gmail.com" className="text-blue-600 hover:underline">ivanltds@gmail.com</a>
          </p>
        </section>
      </div>
    </main>
  )
}
