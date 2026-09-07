<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Категории прав (вкладки в интерфейсе назначения роли)
    |--------------------------------------------------------------------------
    */

    'kategorii' => [
        'resursy' => 'Ресурсы',
        'stranicy' => 'Страницы',
        'vidzhety' => 'Виджеты',
        'otdelnye' => 'Отдельные права',
    ],

    /*
    |--------------------------------------------------------------------------
    | Реестр доступов CRM
    |--------------------------------------------------------------------------
    |
    | kategoriya — ключ из kategorii (вкладка).
    | put — технический путь для подписи в карточке (модель, маршрут и т.д.).
    | Для новых модулей добавляйте группу и вызывайте php artisan dostupy:sync.
    |
    */

    'gruppy' => [
        'polzovateli' => [
            'nazvanie' => 'Пользователи',
            'kategoriya' => 'resursy',
            'put' => 'App\Models\User',
            'dostupy' => [
                'polzovateli.prosmotr' => 'Просмотр',
                'polzovateli.sozdanie' => 'Создание',
                'polzovateli.redaktirovanie' => 'Редактирование',
                'polzovateli.udalenie' => 'Удаление',
            ],
        ],
        'catalog' => [
            'nazvanie' => 'Каталог',
            'kategoriya' => 'resursy',
            'put' => 'App\Models\Catalog',
            'dostupy' => [
                'catalog.view' => 'Просмотр',
                'catalog.manage' => 'Управление',
            ],
        ],
        'panel' => [
            'nazvanie' => 'Панель',
            'kategoriya' => 'stranicy',
            'put' => '/dashboard',
            'dostupy' => [
                'panel.prosmotr' => 'Доступ к панели',
            ],
        ],
        'roli' => [
            'nazvanie' => 'Роли и доступы',
            'kategoriya' => 'otdelnye',
            'put' => 'App\Models\Rol',
            'dostupy' => [
                'roli.prosmotr' => 'Просмотр списка',
                'roli.upravlenie' => 'Создание и редактирование',
                'roli.udalenie' => 'Удаление',
            ],
        ],
        'system_settings' => [
            'nazvanie' => 'Настройки системы',
            'kategoriya' => 'otdelnye',
            'put' => '/system-settings',
            'dostupy' => [
                'system_settings.view' => 'Просмотр',
                'system_settings.manage' => 'Редактирование',
            ],
        ],
        'used_cars' => [
            'nazvanie' => 'Автомобили с пробегом',
            'kategoriya' => 'resursy',
            'put' => '/used-cars',
            'dostupy' => [
                'used_cars.view' => 'Просмотр',
                'used_cars.create' => 'Создание',
                'used_cars.update' => 'Редактирование',
                'used_cars.delete' => 'Удаление',
            ],
        ],
        'cars' => [
            'nazvanie' => 'Новые автомобили',
            'kategoriya' => 'resursy',
            'put' => '/cars',
            'dostupy' => [
                'cars.view' => 'Просмотр',
                'cars.create' => 'Создание',
                'cars.update' => 'Редактирование',
                'cars.delete' => 'Удаление',
            ],
        ],
        'dictionaries' => [
            'nazvanie' => 'Справочники',
            'kategoriya' => 'resursy',
            'put' => '/dictionaries',
            'dostupy' => [
                'dictionaries.view' => 'Просмотр',
                'dictionaries.manage' => 'Управление',
            ],
        ],
    ],

];
