const { useState, useEffect } = React;

// Основной компонент расписания
function WeeklySchedule() {
  // Дни недели
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  
  // Временные слоты
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Загрузка данных из localStorage
  const loadSchedule = () => {
    const saved = localStorage.getItem('weeklySchedule');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Инициализация пустого расписания
    const initialSchedule = {};
    days.forEach(day => {
      initialSchedule[day] = {};
      timeSlots.forEach(time => {
        initialSchedule[day][time] = [];
      });
    });
    return initialSchedule;
  };

  // Состояния
  const [schedule, setSchedule] = useState(loadSchedule);
  const [newTask, setNewTask] = useState('');
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);

  // Сохранение в localStorage при изменении расписания
  useEffect(() => {
    localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
  }, [schedule]);

  // Добавление нового задания
  const addTask = () => {
    if (!newTask.trim()) {
      alert('Пожалуйста, введите текст задания');
      return;
    }

    const task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: newTask.trim()
    };

    setSchedule(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [selectedTime]: [...prev[selectedDay][selectedTime], task]
      }
    }));

    setNewTask('');
  };

  // Удаление задания
  const removeTask = (day, time, taskId) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: prev[day][time].filter(task => task.id !== taskId)
      }
    }));
  };

  // Редактирование задания
  const editTask = (day, time, taskId, newText) => {
    if (!newText.trim()) {
      removeTask(day, time, taskId);
      return;
    }

    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: prev[day][time].map(task =>
          task.id === taskId ? { ...task, text: newText } : task
        )
      }
    }));
  };

  // Очистка всего дня
  const clearDay = (day) => {
    if (!confirm(`Вы уверены, что хотите очистить все задания для ${day}?`)) return;

    setSchedule(prev => {
      const newDaySchedule = {};
      timeSlots.forEach(time => {
        newDaySchedule[time] = [];
      });
      return {
        ...prev,
        [day]: newDaySchedule
      };
    });
  };

  // Очистка всего расписания
  const clearAll = () => {
    if (!confirm('Вы уверены, что хотите очистить всё расписание?')) return;
    
    const emptySchedule = {};
    days.forEach(day => {
      emptySchedule[day] = {};
      timeSlots.forEach(time => {
        emptySchedule[day][time] = [];
      });
    });
    setSchedule(emptySchedule);
  };

  // Обработка нажатия Enter в поле ввода
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="weekly-schedule">
      <h1>📅 Еженедельное расписание дел</h1>
      
      {/* Форма добавления задания */}
      <div className="add-task-form">
        <h3>➕ Добавить новое задание</h3>
        <div className="form-controls">
          <select 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          
          <select 
            value={selectedTime} 
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите ваше задание..."
          />
          
          <button onClick={addTask}>Добавить задание</button>
          <button onClick={clearAll} style={{background: 'linear-gradient(135deg, #ff6b6b, #fa5252)'}}>
            Очистить всё
          </button>
        </div>
      </div>

      {/* Таблица расписания */}
      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Время ⏰</th>
              {days.map(day => (
                <th key={day}>
                  <div className="day-header">
                    <span>{day}</span>
                    <button 
                      className="clear-day-btn"
                      onClick={() => clearDay(day)}
                      title="Очистить день"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="time-slot">{time}</td>
                {days.map(day => (
                  <td key={`${day}-${time}`} className="task-cell">
                    <div className="tasks-list">
                      {schedule[day]?.[time]?.map(task => (
                        <div key={task.id} className="task-item">
                          <input
                            type="text"
                            value={task.text}
                            onChange={(e) => editTask(day, time, task.id, e.target.value)}
                            onBlur={(e) => editTask(day, time, task.id, e.target.value)}
                            className="task-input"
                            placeholder="Редактировать задание..."
                          />
                          <button
                            onClick={() => removeTask(day, time, task.id)}
                            className="remove-task-btn"
                            title="Удалить задание"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Статистика */}
      <div className="stats">
        <h3>📊 Статистика заданий</h3>
        <div className="stats-grid">
          {days.map(day => {
            const dayTasks = Object.values(schedule[day] || {}).flat();
            return (
              <div key={day} className="stat-item">
                <strong>{day}</strong>
                <span>{dayTasks.length} заданий</span>
              </div>
            );
          })}
          <div className="stat-item">
            <strong>Всего за неделю</strong>
            <span>
              {days.reduce((total, day) => 
                total + Object.values(schedule[day] || {}).flat().length, 0
              )} заданий
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Рендеринг приложения
ReactDOM.render(<WeeklySchedule />, document.getElementById('root'));