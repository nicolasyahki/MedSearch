import SearchBar from './SearchBar'

function MainContent() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-h1 text-text-primary mb-2">Recherche médicale</h1>
          <p className="text-body text-text-secondary">Recherchez des patients, dossiers ou médicaments</p>
        </div>

        <SearchBar />
      </div>
    </main>
  )
}

export default MainContent
