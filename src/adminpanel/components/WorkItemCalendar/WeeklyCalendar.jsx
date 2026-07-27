import React, { useState, useEffect, useMemo } from 'react'
import { navigate } from 'vike/client/router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { tradeJobsApi } from '../../lib/endpoints.js'
import Spinner from '../../../ui/Spinner.jsx'

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday as first day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function WeeklyCalendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    tradeJobsApi.calendar({ from: weekStart.toISOString().slice(0, 10), to: weekEnd.toISOString().slice(0, 10) })
      .then((data) => { if (!cancelled) setEvents(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [weekStart, weekEnd])

  const eventsForDay = (day) => {
    return events
      .filter((ev) => ev.start && new Date(ev.start).toDateString() === day.toDateString())
      .sort((a, b) => new Date(a.start) - new Date(b.start))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-navy-900">
          {weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {addDays(weekStart, 6).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {days.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div key={day.toISOString()} className="min-h-[140px]">
                <div className={`text-xs font-semibold mb-2 px-1 ${isToday ? 'text-navy-900' : 'text-gray-400'}`}>
                  {day.toLocaleDateString('en-GB', { weekday: 'short' })} <span className="tabular-nums">{day.getDate()}</span>
                </div>
                <div className="space-y-1.5">
                  {eventsForDay(day).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => navigate(`/admin/jobs/${ev.id}`)}
                      className="w-full text-left px-2 py-1.5 rounded-md text-xs border-l-2"
                      style={{ backgroundColor: `${ev.backgroundColor}1A`, borderColor: ev.borderColor, color: ev.backgroundColor }}
                    >
                      <div className="font-medium truncate">{ev.extendedProps?.customer || ev.title}</div>
                      {!ev.allDay && (
                        <div className="opacity-70">{new Date(ev.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WeeklyCalendar
