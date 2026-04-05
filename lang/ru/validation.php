<?php

return [
    'accepted' => 'Поле :attribute должно быть принято.',
    'boolean' => 'Поле :attribute должно быть логическим значением.',
    'confirmed' => 'Поле :attribute не совпадает с подтверждением.',
    'current_password' => 'Введен неверный пароль.',
    'date' => 'Поле :attribute должно быть корректной датой.',
    'email' => 'Поле :attribute должно быть действительным электронным адресом.',
    'exists' => 'Выбранное значение для :attribute некорректно.',
    'integer' => 'Поле :attribute должно быть целым числом.',
    'max' => [
        'string' => 'Поле :attribute не может быть длиннее :max символов.',
    ],
    'min' => [
        'numeric' => 'Поле :attribute должно быть не меньше :min.',
        'string' => 'Поле :attribute должно содержать минимум :min символов.',
    ],
    'numeric' => 'Поле :attribute должно быть числом.',
    'required' => 'Поле :attribute обязательно для заполнения.',
    'string' => 'Поле :attribute должно быть строкой.',
    'unique' => 'Такое значение поля :attribute уже существует.',

    'attributes' => [
        'name' => 'название',
        'title' => 'заголовок',
        'description' => 'описание',
        'email' => 'e-mail',
        'password' => 'пароль',
        'password_confirmation' => 'подтверждение пароля',
        'current_password' => 'текущий пароль',
        'due_date' => 'дата задачи',
        'due_time' => 'время',
        'spent_on' => 'дата расхода',
        'received_on' => 'дата дохода',
        'amount' => 'сумма',
        'source' => 'источник',
        'note' => 'комментарий',
        'expense_category_id' => 'категория расхода',
        'quantity' => 'количество',
        'is_checked' => 'отметка',
        'color' => 'цвет',
    ],
];
