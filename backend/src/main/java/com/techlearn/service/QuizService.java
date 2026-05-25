package com.techlearn.service;

import com.techlearn.dto.*;
import com.techlearn.model.*;
import com.techlearn.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final UserQuizAttemptRepository attemptRepository;
    private final UserRepository userRepository;

    public QuizDto getQuiz(UUID quizId) {
        Quiz quiz = quizRepository.findByIdAndIsPublishedTrue(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return toDTO(quiz);
    }

    public List<QuizDto> getQuizzesByLesson(UUID lessonId) {
        return quizRepository.findByLessonIdAndIsPublishedTrue(lessonId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<QuizDto> getQuizzesByTrack(String trackId) {
        return quizRepository.findByTrackIdAndIsPublishedTrue(trackId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserQuizAttemptDTO startQuizAttempt(UUID userId, UUID quizId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        attemptRepository.findByUserIdAndQuizId(userId, quizId).stream()
                .filter(UserQuizAttempt::getIsLatestAttempt)
                .forEach(attempt -> {
                    attempt.setIsLatestAttempt(false);
                    attemptRepository.save(attempt);
                });

        UserQuizAttempt attempt = UserQuizAttempt.builder()
                .user(user)
                .quiz(quiz)
                .score(0)
                .totalPoints(0)
                .timeTakenSeconds(0L)
                .status(ProgressStatus.IN_PROGRESS)
                .isLatestAttempt(true)
                .build();

        UserQuizAttempt saved = attemptRepository.save(attempt);
        return toAttemptDTO(saved);
    }

    public UserQuizAttemptDTO submitQuizAttempt(UUID userId, UUID quizId, Map<String, Object> answers) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        UserQuizAttempt attempt = attemptRepository.findByUserIdAndQuizIdAndIsLatestAttemptTrue(userId, quizId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        int totalScore = 0;
        int totalPossible = 0;
        long startTime = System.currentTimeMillis();

        for (Map.Entry<String, Object> answer : answers.entrySet()) {
            UUID questionId = UUID.fromString(answer.getKey());
            QuizQuestion question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            UserAnswer userAnswer = UserAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .build();

            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                evaluateMultipleChoice(userAnswer, answer.getValue(), question);
            } else if (question.getQuestionType() == QuestionType.SHORT_ANSWER) {
                userAnswer.setTextAnswer(answer.getValue().toString());
                userAnswer.setIsCorrect(false);
            } else if (question.getQuestionType() == QuestionType.CODING) {
                userAnswer.setCodeAnswer(answer.getValue().toString());
                userAnswer.setIsCorrect(false);
            }

            attempt.getUserAnswers().add(userAnswer);
            totalScore += userAnswer.getPointsEarned() != null ? userAnswer.getPointsEarned() : 0;
            totalPossible += question.getPoints() != null ? question.getPoints() : 0;
        }

        long endTime = System.currentTimeMillis();

        attempt.setScore(totalScore);
        attempt.setTotalPoints(totalPossible);
        attempt.setTimeTakenSeconds(Math.max(0L, (endTime - startTime) / 1000));
        attempt.setStatus(totalScore >= quiz.getPassingScore() ? ProgressStatus.COMPLETED : ProgressStatus.FAILED);
        attempt.setIsLatestAttempt(true);

        UserQuizAttempt saved = attemptRepository.save(attempt);
        return toAttemptDTO(saved);
    }

    public List<UserQuizAttemptDTO> getUserAttempts(UUID userId, UUID quizId) {
        return attemptRepository.findByUserIdAndQuizId(userId, quizId).stream()
                .map(this::toAttemptDTO)
                .collect(Collectors.toList());
    }

    public UserQuizAttemptDTO getLatestAttempt(UUID userId, UUID quizId) {
        UserQuizAttempt attempt = attemptRepository.findByUserIdAndQuizIdAndIsLatestAttemptTrue(userId, quizId)
                .orElseThrow(() -> new RuntimeException("No quiz attempt found"));
        return toAttemptDTO(attempt);
    }

    private void evaluateMultipleChoice(UserAnswer userAnswer, Object selectedValue, QuizQuestion question) {
        UUID selectedOptionId = UUID.fromString(selectedValue.toString());
        QuestionOption option = question.getOptions().stream()
                .filter(o -> o.getId().equals(selectedOptionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Option not found"));

        userAnswer.setOption(option);
        userAnswer.setIsCorrect(option.getIsCorrect());
        userAnswer.setPointsEarned(option.getIsCorrect() ? question.getPoints() : 0);
    }

    private QuizDto toDTO(Quiz quiz) {
        List<QuestionDto> questions = quiz.getQuestions().stream()
                .sorted(Comparator.comparing(QuizQuestion::getQuestionOrder))
                .map(this::questionToDto)
                .collect(Collectors.toList());

        return new QuizDto(questions, quiz.getPassingScore());
    }

    private QuestionDto questionToDto(QuizQuestion question) {
        List<String> options = question.getOptions().stream()
                .sorted(Comparator.comparing(QuestionOption::getOptionOrder))
                .map(QuestionOption::getOptionText)
                .collect(Collectors.toList());

        return new QuestionDto(question.getId().toString(), question.getQuestionText(), options);
    }

    private UserQuizAttemptDTO toAttemptDTO(UserQuizAttempt attempt) {
        List<UserAnswerDTO> answers = attempt.getUserAnswers().stream()
                .map(this::answerToDTO)
                .collect(Collectors.toList());

        return UserQuizAttemptDTO.builder()
                .id(attempt.getId())
                .userId(attempt.getUser().getId())
                .quizId(attempt.getQuiz().getId())
                .score(attempt.getScore())
                .timeTakenSeconds(attempt.getTimeTakenSeconds() != null ? attempt.getTimeTakenSeconds().intValue() : null)
                .isCompleted(attempt.getStatus() == ProgressStatus.COMPLETED)
                .isLatestAttempt(attempt.getIsLatestAttempt())
                .answers(answers)
                .createdAt(attempt.getCreatedAt())
                .build();
    }

    private UserAnswerDTO answerToDTO(UserAnswer answer) {
        return UserAnswerDTO.builder()
                .id(answer.getId())
                .questionId(answer.getQuestion().getId())
                .selectedOptionId(answer.getOption() != null ? answer.getOption().getId() : null)
                .textAnswer(answer.getTextAnswer())
                .codeAnswer(answer.getCodeAnswer())
                .isCorrect(answer.getIsCorrect())
                .pointsEarned(answer.getPointsEarned())
                .createdAt(answer.getCreatedAt())
                .build();
    }
}
