<?php

namespace App\Services;

use App\Models\Catalog\AutoMark;
use App\Models\Catalog\AutoModel;
use App\Models\Dictionaries\BodyType;
use App\Models\Dictionaries\CarStatus;
use App\Models\Dictionaries\EngineType;
use App\Models\Dictionaries\InteriorType;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\Transmission;
use App\Models\Dictionaries\UsedCarStatus;
use App\Models\Dictionaries\WheelType;
use App\Models\User;
use App\Support\ActivityFieldLabels;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

class ActivityHistoryService
{
  public function allows(string $event): bool
  {
    $settings = SystemSettingsService::current();

    return match ($event) {
      'viewed' => (bool) ($settings->activity_log_view_enabled ?? true),
      'created', 'updated' => (bool) ($settings->activity_log_update_enabled ?? true),
      'deleted' => (bool) ($settings->activity_log_delete_enabled ?? true),
      'restored' => (bool) ($settings->activity_log_restore_enabled ?? true),
      default => true,
    };
  }

  /**
   * @return list<array<string, mixed>>
   */
  public function forSubject(Model $subject, int $limit = 50): array
  {
    $labels = $this->labelsFor($subject);
    $isUsedCar = $subject instanceof \App\Models\UsedCars\UsedCar;

    return Activity::query()
      ->where('subject_type', $subject->getMorphClass())
      ->where('subject_id', $subject->getKey())
      ->with('causer:id,name')
      ->latest('id')
      ->limit($limit)
      ->get()
      ->map(fn (Activity $activity) => $this->serialize($activity, $labels, $isUsedCar))
      ->values()
      ->all();
  }

  public function logViewed(Model $subject, ?Model $causer = null): void
  {
    if (! $this->allows('viewed')) {
      return;
    }

    activity()
      ->performedOn($subject)
      ->causedBy($causer)
      ->event('viewed')
      ->withProperties([])
      ->log('Просмотр карточки');
  }

  public function logDeleted(Model $subject, ?Model $causer = null): void
  {
    if (! $this->allows('deleted')) {
      return;
    }

    activity()
      ->performedOn($subject)
      ->causedBy($causer)
      ->event('deleted')
      ->withProperties([])
      ->log('Удаление автомобиля');
  }

  public function logRestored(Model $subject, ?Model $causer = null): void
  {
    if (! $this->allows('restored')) {
      return;
    }

    activity()
      ->performedOn($subject)
      ->causedBy($causer)
      ->event('restored')
      ->withProperties([])
      ->log('Восстановление автомобиля');
  }

  public function logForceDeleted(Model $subject, ?Model $causer = null): void
  {
    if (! $this->allows('deleted')) {
      return;
    }

    activity()
      ->performedOn($subject)
      ->causedBy($causer)
      ->event('deleted')
      ->withProperties([])
      ->log('Окончательное удаление автомобиля');
  }

  /**
   * @param  array<string, string>  $labels
   * @return array<string, mixed>
   */
  private function serialize(Activity $activity, array $labels, bool $isUsedCar): array
  {
    $event = $activity->event ?: $this->guessEvent($activity->description);
    $changes = $activity->changes();

    /** @var Collection<string, mixed> $attributes */
    $attributes = collect($changes->get('attributes', []));
    /** @var Collection<string, mixed> $old */
    $old = collect($changes->get('old', []));

    $keys = $attributes->keys()->merge($old->keys())->unique()->values();

    $diff = $keys
      ->map(function (string $key) use ($attributes, $old, $labels, $isUsedCar) {
        return [
          'field' => $key,
          'label' => $labels[$key] ?? $key,
          'old' => $this->formatFieldValue($key, $old->get($key), $isUsedCar),
          'new' => $this->formatFieldValue($key, $attributes->get($key), $isUsedCar),
        ];
      })
      ->values()
      ->all();

    return [
      'id' => $activity->id,
      'event' => $event,
      'event_label' => $this->eventLabel($event),
      'description' => $activity->description,
      'causer' => $activity->causer ? [
        'id' => $activity->causer->id,
        'name' => $activity->causer->name ?? 'Пользователь',
      ] : null,
      'created_at' => $activity->created_at?->timezone(config('app.timezone'))->format('d.m.Y H:i'),
      'created_at_iso' => $activity->created_at?->toIso8601String(),
      'changes' => $diff,
    ];
  }

  /**
   * @return array<string, string>
   */
  private function labelsFor(Model $subject): array
  {
    return match (true) {
      $subject instanceof \App\Models\Cars\Car => ActivityFieldLabels::forCars(),
      $subject instanceof \App\Models\UsedCars\UsedCar => ActivityFieldLabels::forUsedCars(),
      default => [],
    };
  }

  private function eventLabel(string $event): string
  {
    return match ($event) {
      'created' => 'Создал',
      'updated' => 'Изменил',
      'deleted' => 'Удалил',
      'restored' => 'Восстановил',
      'viewed' => 'Посмотрел',
      default => $event,
    };
  }

  private function guessEvent(string $description): string
  {
    return match (true) {
      str_contains($description, 'created') => 'created',
      str_contains($description, 'updated') => 'updated',
      str_contains($description, 'deleted') => 'deleted',
      str_contains($description, 'restored') => 'restored',
      str_contains(mb_strtolower($description), 'просмотр') => 'viewed',
      default => 'updated',
    };
  }

  private function formatFieldValue(string $field, mixed $value, bool $isUsedCar): ?string
  {
    if ($value === null || $value === '') {
      return null;
    }

    return match ($field) {
      'mark_id' => $this->nameById(AutoMark::class, $value),
      'model_id' => $this->nameById(AutoModel::class, $value),
      'showroom_id' => $this->nameById(Showroom::class, $value),
      'body_type_id' => $this->nameById(BodyType::class, $value),
      'transmission_id' => $this->nameById(Transmission::class, $value),
      'engine_type_id' => $this->nameById(EngineType::class, $value),
      'wheel_type_id' => $this->nameById(WheelType::class, $value),
      'interior_type_id' => $this->nameById(InteriorType::class, $value),
      'status_id' => $this->nameById($isUsedCar ? UsedCarStatus::class : CarStatus::class, $value),
      'manager_id' => $this->nameById(User::class, $value),
      'pts_type' => match ((int) $value) {
        0 => 'Нет',
        1 => 'ПТС',
        2 => 'ЭПТС',
        default => (string) $value,
      },
      'transit' => match ((int) $value) {
        0 => 'Нет',
        1 => 'Выезд',
        2 => 'Въезд',
        default => (string) $value,
      },
      default => $this->formatScalar($value),
    };
  }

  /**
   * @param  class-string<Model>  $modelClass
   */
  private function nameById(string $modelClass, mixed $id): string
  {
    if (! is_numeric($id)) {
      return (string) $id;
    }

    $name = $modelClass::query()->whereKey((int) $id)->value('name');

    return $name ? (string) $name : '#'.$id;
  }

  private function formatScalar(mixed $value): string
  {
    if (is_bool($value)) {
      return $value ? 'Да' : 'Нет';
    }

    if (is_array($value)) {
      return json_encode($value, JSON_UNESCAPED_UNICODE) ?: '—';
    }

    if ($value instanceof \DateTimeInterface) {
      return $value->format('d.m.Y');
    }

    if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}/', $value) === 1) {
      try {
        return \Carbon\Carbon::parse($value)->format('d.m.Y');
      } catch (\Throwable) {
        return $value;
      }
    }

    return (string) $value;
  }
}
