<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$subscribersFile = 'subscribers.json';

// Helper function to load subscribers
function loadSubscribers($file) {
    $subscribers = [];
    if (file_exists($file)) {
        $content = file_get_contents($file);
        if (!empty($content)) {
            $subscribers = json_decode($content, true) ?: [];
        }
    }
    return $subscribers;
}

// Helper function to save subscribers
function saveSubscribers($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

// Determine action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'subscribe':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (empty($data['name']) || empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
            exit;
        }

        $subscribers = loadSubscribers($subscribersFile);

        // Check for duplicates
        foreach ($subscribers as $sub) {
            if ($sub['email'] === $data['email']) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already subscribed']);
                exit;
            }
        }

        // Add new subscriber
        $subscribers[] = [
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'date' => date('Y-m-d H:i:s')
        ];

        saveSubscribers($subscribersFile, $subscribers);
        echo json_encode(['success' => true, 'message' => 'Subscription successful']);
        break;

    case 'unsubscribe':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (empty($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            exit;
        }

        $subscribers = loadSubscribers($subscribersFile);
        $found = false;
        $newList = [];

        // Filter out the email
        foreach ($subscribers as $sub) {
            if ($sub['email'] === $data['email']) {
                $found = true;
            } else {
                $newList[] = $sub;
            }
        }

        if (!$found) {
            http_response_code(404);
            echo json_encode(['error' => 'Email not found']);
            exit;
        }

        saveSubscribers($subscribersFile, $newList);
        echo json_encode(['success' => true, 'message' => 'Unsubscribed successfully']);
        break;

    case 'list':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }

        $subscribers = loadSubscribers($subscribersFile);
        echo json_encode(['success' => true, 'subscribers' => $subscribers]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}
?>