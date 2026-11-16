import { useState, useEffect } from 'react';

const DEFAULT_EXERCISES = {
  'Göğüs': [
    'Flat Bench Press',
    'Incline Bench Press',
    'Incline Dumbbell Press',
    'Dumbbell Fly',
    'Cable Crossover',
    'Push-Up (Şınav)'
  ],
  'Sırt': [
    'Deadlift',
    'Lat Pulldown',
    'Barbell Row',
    'Seated Cable Row',
    'One-Arm Dumbbell Row',
    'Pull-Up (Barfiks)'
  ],
  'Bacak': [
    'Barbell Squat',
    'Leg Press',
    'Romanian Deadlift',
    'Leg Extension',
    'Leg Curl',
    'Calf Raise'
  ],
  'Omuz': [
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Lateral Raise',
    'Front Raise',
    'Face Pull',
    'Rear Delt Fly'
  ],
  'Kol': [
    'Barbell Curl',
    'Dumbbell Bicep Curl',
    'Hammer Curl',
    'Triceps Pushdown',
    'Skull Crusher',
    'Dips'
  ],
  'Karın / Kardiyo': [
    'Ab Wheel Rollout',
    'Plank',
    'Hanging Leg Raise',
    'Yüzme (Serbest)',
    'Koşu Bandı',
    'Bisiklet'
  ]
};

function App() {
  // 1. Kullanıcı Profili
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('user_profile');
    return savedProfile
      ? JSON.parse(savedProfile)
      : { name: 'Sporcu', weight: '75', height: '178', goal: 'Güç & Hacim' };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 2. Hareket Kütüphanesi (Sınıflandırılmış Hazır + Özel Hareketler)
  const [exerciseLibrary, setExerciseLibrary] = useState(() => {
    const savedLib = localStorage.getItem('exercise_library');
    return savedLib ? JSON.parse(savedLib) : DEFAULT_EXERCISES;
  });
  const [isManagingLibrary, setIsManagingLibrary] = useState(false);
  const [newLibCategory, setNewLibCategory] = useState('Göğüs');
  const [newLibExercise, setNewLibExercise] = useState('');

  // 3. Kaydedilmiş Geçmiş Antrenman Seansları
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('workout_sessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });

  // 4. O An Oluşturulan Günlük Antrenman Listesi (Taslak)
  const [sessionTitle, setSessionTitle] = useState('');
  const [currentExercises, setCurrentExercises] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null);

  // 5. Hareket Seçimi ve Set Giriş Formu
  const categories = Object.keys(exerciseLibrary);
  const [category, setCategory] = useState('Göğüs');
  const [selectedExercise, setSelectedExercise] = useState(DEFAULT_EXERCISES['Göğüs'][0]);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [sets, setSets] = useState([{ weight: '', reps: '' }]);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('exercise_library', JSON.stringify(exerciseLibrary));
  }, [exerciseLibrary]);

  useEffect(() => {
    localStorage.setItem('workout_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Kategori değiştiğinde o sınıfın ilk hareketini otomatik seç
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const list = exerciseLibrary[newCat] || [];
    if (list.length > 0) {
      setSelectedExercise(list[0]);
      setCustomExerciseName('');
    } else {
      setSelectedExercise('__CUSTOM__');
    }
  };

  // Kütüphaneye yeni kalıcı hareket ekle
  const handleAddToLibrary = (e) => {
    e.preventDefault();
    const trimmed = newLibExercise.trim();
    if (!trimmed) return;

    const existing = exerciseLibrary[newLibCategory] || [];
    if (!existing.includes(trimmed)) {
      const updated = {
        ...exerciseLibrary,
        [newLibCategory]: [...existing, trimmed]
      };
      setExerciseLibrary(updated);
      if (newLibCategory === category) {
        setSelectedExercise(trimmed);
      }
    }
    setNewLibExercise('');
  };

  // Kütüphaneden hareket sil
  const handleRemoveFromLibrary = (cat, exName) => {
    const updatedList = exerciseLibrary[cat].filter((item) => item !== exName);
    setExerciseLibrary({
      ...exerciseLibrary,
      [cat]: updatedList
    });
    if (cat === category && selectedExercise === exName) {
      setSelectedExercise(updatedList[0] || '__CUSTOM__');
    }
  };

  // Set işlemleri
  const handleAddSetRow = () => {
    const lastSet = sets[sets.length - 1];
    setSets([...sets, { weight: lastSet ? lastSet.weight : '', reps: lastSet ? lastSet.reps : '' }]);
  };

  const handleRemoveSetRow = (index) => {
    if (sets.length === 1) return;
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleSetChange = (index, field, value) => {
    const updatedSets = sets.map((set, i) =>
      i === index ? { ...set, [field]: value } : set
    );
    setSets(updatedSets);
  };

  // Hareketi günlük taslak listeye ekle veya düzenlemeyi kaydet
  const handleSaveExerciseToDraft = (e) => {
    e.preventDefault();
    const finalName =
      selectedExercise === '__CUSTOM__' ? customExerciseName.trim() : selectedExercise;

    if (!finalName) return;

    const validSets = sets
      .filter((s) => s.weight !== '' && s.reps !== '')
      .map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) }));

    if (validSets.length === 0) return;

    if (editingDraftId) {
      // Mevcut hareketi güncelle
      setCurrentExercises(
        currentExercises.map((ex) =>
          ex.id === editingDraftId
            ? { ...ex, name: finalName, category, sets: validSets }
            : ex
        )
      );
      setEditingDraftId(null);
    } else {
      // Yeni hareket ekle
      const newExercise = {
        id: Date.now(),
        name: finalName,
        category,
        sets: validSets
      };
      setCurrentExercises([...currentExercises, newExercise]);
    }

    setCustomExerciseName('');
    setSets([{ weight: '', reps: '' }]);
  };

  // Taslaktaki bir hareketi düzenlemek için yukarıdaki forma geri yükle
  const handleEditDraftExercise = (ex) => {
    setEditingDraftId(ex.id);
    setCategory(ex.category);

    const catList = exerciseLibrary[ex.category] || [];
    if (catList.includes(ex.name)) {
      setSelectedExercise(ex.name);
      setCustomExerciseName('');
    } else {
      setSelectedExercise('__CUSTOM__');
      setCustomExerciseName(ex.name);
    }

    setSets(ex.sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps) })));
  };

  const handleCancelEdit = () => {
    setEditingDraftId(null);
    setSets([{ weight: '', reps: '' }]);
    setCustomExerciseName('');
  };

  const handleRemoveDraftExercise = (id) => {
    if (editingDraftId === id) handleCancelEdit();
    setCurrentExercises(currentExercises.filter((ex) => ex.id !== id));
  };

  // Günlük listeyi tamamlayıp geçmişe kaydet
  const handleSaveSession = () => {
    if (currentExercises.length === 0) return;

    const today = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const newSession = {
      id: Date.now(),
      title: sessionTitle.trim() || `${today} Antrenmanı`,
      date: today,
      exercises: currentExercises
    };

    setSessions([newSession, ...sessions]);
    setCurrentExercises([]);
    setSessionTitle('');
    setEditingDraftId(null);
  };

  const handleDeleteSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  // İstatistikler
  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((totalAcc, session) => {
    const sessionVol = session.exercises.reduce((exAcc, ex) => {
      const setsVol = ex.sets.reduce((sAcc, s) => sAcc + s.weight * s.reps, 0);
      return exAcc + setsVol;
    }, 0);
    return totalAcc + sessionVol;
  }, 0);

  return (
    <div className="container">
      <header>
        <h1>Antrenman Günlüğüm</h1>
        <p>Sınıflandırılmış hareket kütüphanesi & set takibi</p>
      </header>

      {/* KULLANICI PROFİL KARTI */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-title">
            <h2>{profile.name}</h2>
            <span>Hedef: {profile.goal}</span>
          </div>
          <button
            className="edit-profile-btn"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            {isEditingProfile ? 'Kaydet & Kapat' : 'Profili Düzenle'}
          </button>
        </div>

        {!isEditingProfile ? (
          <div className="profile-badges">
            <span className="p-badge">Kilo: {profile.weight} kg</span>
            <span className="p-badge">Boy: {profile.height} cm</span>
          </div>
        ) : (
          <div className="profile-form">
            <input
              type="text"
              placeholder="Adın Soyadın"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <div className="profile-row">
              <input
                type="number"
                placeholder="Kilo (kg)"
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
              />
              <input
                type="number"
                placeholder="Boy (cm)"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Hedefin (ör. Hipertrofi, Güç Artışı)"
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* ÖZET İSTATİSTİKLER */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Tamamlanan Gün</span>
          <strong>{totalSessions} Antrenman</strong>
        </div>
        <div className="stat-card">
          <span>Toplam Hacim</span>
          <strong>{totalVolume.toLocaleString('tr-TR')} kg</strong>
        </div>
      </div>

      {/* YENİ ANTRENMAN OLUŞTURUCU */}
      <div className="builder-box">
        <div className="section-title">
          <span>{editingDraftId ? 'Hareketi Düzenle' : 'Antrenman Listesi Oluştur'}</span>
          <button
            type="button"
            className="library-toggle-btn"
            onClick={() => setIsManagingLibrary(!isManagingLibrary)}
          >
            {isManagingLibrary ? 'Kütüphaneyi Kapat' : '+ Hareketleri Düzenle'}
          </button>
        </div>

        {/* HAREKET KÜTÜPHANESİ YÖNETİM PANELİ */}
        {isManagingLibrary && (
          <div className="library-manager">
            <h4>Hareket Kütüphanesini Özelleştir</h4>
            <form className="library-add-row" onSubmit={handleAddToLibrary}>
              <select
                value={newLibCategory}
                onChange={(e) => setNewLibCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Yeni hareket adı..."
                value={newLibExercise}
                onChange={(e) => setNewLibExercise(e.target.value)}
              />
              <button type="submit" className="add-btn">
                Ekle
              </button>
            </form>

            <div className="library-tags">
              {(exerciseLibrary[newLibCategory] || []).map((exName) => (
                <span key={exName} className="lib-tag">
                  {exName}
                  <button
                    type="button"
                    onClick={() => handleRemoveFromLibrary(newLibCategory, exName)}
                    title="Listeden çıkar"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="input-group">
          <input
            type="text"
            placeholder="Antrenman Başlığı (ör. İtiş Günü, Göğüs & Arka Kol)"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
          />
        </div>

        <form onSubmit={handleSaveExerciseToDraft}>
          <div className="input-group">
            <div className="ex-top-row">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {(exerciseLibrary[category] || []).map((exName) => (
                  <option key={exName} value={exName}>
                    {exName}
                  </option>
                ))}
                <option value="__CUSTOM__">+ Diğer (Manuel Yaz)...</option>
              </select>
            </div>

            {selectedExercise === '__CUSTOM__' && (
              <input
                type="text"
                placeholder="Özel hareket adını yazın..."
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                required
              />
            )}
          </div>

          {/* SET BAZLI AĞIRLIK VE TEKRAR GİRİŞİ */}
          <div className="sets-container">
            {sets.map((set, index) => (
              <div key={index} className="set-row">
                <span className="set-label">{index + 1}. Set</span>
                <input
                  type="number"
                  placeholder="Kilo (kg)"
                  value={set.weight}
                  onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                  min="0"
                  step="0.5"
                  required
                />
                <input
                  type="number"
                  placeholder="Tekrar"
                  value={set.reps}
                  onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                  min="1"
                  required
                />
                {sets.length > 1 && (
                  <button
                    type="button"
                    className="remove-set-btn"
                    onClick={() => handleRemoveSetRow(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="btn-row">
            <button type="button" className="secondary-btn" onClick={handleAddSetRow}>
              + Set Ekle
            </button>
            {editingDraftId ? (
              <button type="submit" className="update-btn">
                ✓ Değişikliği Kaydet
              </button>
            ) : (
              <button type="submit" className="add-btn">
                Listeye Ekle
              </button>
            )}
          </div>

          {editingDraftId && (
            <button
              type="button"
              className="secondary-btn"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={handleCancelEdit}
            >
              Düzenlemeyi İptal Et
            </button>
          )}
        </form>

        {/* O AN EKLENEN HAREKETLER LİSTESİ (TASLAK) */}
        {currentExercises.length > 0 && (
          <div className="draft-section">
            <div className="section-title">
              <span>Bugünün Listesi ({currentExercises.length} Hareket)</span>
            </div>

            {currentExercises.map((ex) => (
              <div
                key={ex.id}
                className={`draft-item ${editingDraftId === ex.id ? 'editing' : ''}`}
              >
                <div>
                  <h4>
                    {ex.name} <span className="badge">{ex.category}</span>
                  </h4>
                  <div className="draft-sets">
                    {ex.sets
                      .map((s, idx) => `${idx + 1}. Set: ${s.weight}kg × ${s.reps}`)
                      .join('  |  ')}
                  </div>
                </div>
                <div className="draft-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => handleEditDraftExercise(ex)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleRemoveDraftExercise(ex.id)}
                  >
                    Çıkar
                  </button>
                </div>
              </div>
            ))}

            <button className="save-session-btn" onClick={handleSaveSession}>
              ✓ Antrenmanı Tamamla ve Kaydet
            </button>
          </div>
        )}
      </div>

      {/* KAYDEDİLMİŞ GEÇMİŞ ANTRENMAN LİSTELERİ */}
      <h2 className="history-title">Geçmiş Antrenman Listeleri</h2>

      {sessions.length === 0 ? (
        <div className="empty-state">
          Henüz kaydedilmiş bir antrenman günün yok. Yukarıdan hareketlerini ekleyip listeni kaydet!
        </div>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-header">
              <div>
                <h3>{session.title}</h3>
                <div className="session-meta">
                  {session.date} • {session.exercises.length} Hareket
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteSession(session.id)}
              >
                Günü Sil
              </button>
            </div>

            {session.exercises.map((ex) => (
              <div key={ex.id} className="session-exercise">
                <div className="session-ex-title">
                  {ex.name} <span className="badge">{ex.category}</span>
                </div>
                <div className="set-pills">
                  {ex.sets.map((s, i) => (
                    <span key={i} className="set-pill">
                      {i + 1}. Set: <strong>{s.weight} kg</strong> × {s.reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default App;