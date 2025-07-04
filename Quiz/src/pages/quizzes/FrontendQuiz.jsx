import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuizTemplate from '../../components/QuizTemplate';

function FrontendQuiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questions, setQuestions] = useState([
    {
      questionText: 'What is the purpose of CSS Grid?',
      options: [
        'To add animations',
        'To create two-dimensional layouts',
        'To handle form submissions',
        'To manage state in applications'

      ],
      correctOption: 'To create two-dimensional layouts'
    },

    {
      questionText: 'Which of these is NOT a valid CSS selector?',
      options: [
        '.class-name',
        '#id-name',
        '@element-name',
        '[attribute=value]'

      ],
      correctOption: '@element-name'
    },

    {
      questionText: 'What is the purpose of semantic HTML?',
      options: [
        'To make the code look better',
        'To provide meaning and structure to web content',
        'To improve website speed',
        'To add styling to elements'

      ],
      correctOption: 'To provide meaning and structure to web content'
    },

      {
      questionText: 'What is the box model in CSS?',
      options: [
        'A JavaScript framework',
        'A layout model that defines how elements are structured',
        'A type of database',
        'A design pattern'

      ],
      correctOption: 'A layout model that defines how elements are structured'
    },

    {
      questionText: 'Which unit is relative to the viewport width?',
      options: [
        'px',
        'vw',
        'em',
        'rem'

      ],
      correctOption: 'vw'
    }
  ]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/quizzes/6`);
        const data = await response.json();
        if(data.status === 'error') {
          const quizzes = await fetch('http://localhost:3000/api/quizzes/init');
          const data2 = await quizzes.json();
          const formattedQuestions = data2.questions.map(q => ({
            questionText: q.text, 
            options: q.options,
            correctOption: q.correctOption
          }));
          setQuestions(formattedQuestions);
        }
        else if(data.status === 'ok'){
          const formattedQuestions = data.questions.map(q => ({
            questionText: q.text, 
            options: q.options,
            correctOption: q.correctOption
          }));
          setQuestions(formattedQuestions);
          console.log('Formatted questions:', formattedQuestions);
        }
      } catch (error) {
        setQuestions([
          {
            questionText: 'What is the purpose of CSS Grid?',
            options: [
              'To add animations',
              'To create two-dimensional layouts',
              'To handle form submissions',
              'To manage state in applications'
      
            ],
            correctOption: 'To create two-dimensional layouts'
          },
      
          {
            questionText: 'Which of these is NOT a valid CSS selector?',
            options: [
              '.class-name',
              '#id-name',
              '@element-name',
              '[attribute=value]'
      
            ],
            correctOption: '@element-name'
          },
      
          {
            questionText: 'What is the purpose of semantic HTML?',
            options: [
              'To make the code look better',
              'To provide meaning and structure to web content',
              'To improve website speed',
              'To add styling to elements'
      
            ],
            correctOption: 'To provide meaning and structure to web content'
          },
      
            {
            questionText: 'What is the box model in CSS?',
            options: [
              'A JavaScript framework',
              'A layout model that defines how elements are structured',
              'A type of database',
              'A design pattern'
      
            ],
            correctOption: 'A layout model that defines how elements are structured'
          },
      
          {
            questionText: 'Which unit is relative to the viewport width?',
            options: [
              'px',
              'vw',
              'em',
              'rem'
      
            ],
            correctOption: 'vw'
          }
        ]);
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);



  useEffect(() => {
    if (!showScore && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleQuizCompletion(selectedAnswers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, showScore, selectedAnswers]);

  const handleAnswerClick = (selectedAnswer) => {
    if (isSubmitting) return;
    
    console.log(`Question ${currentQuestion + 1} selected answer:`, selectedAnswer);
    
    const newSelectedAnswers = {
      ...selectedAnswers,
      [currentQuestion]: selectedAnswer 
    };
    
    console.log('Current state of answers:', newSelectedAnswers);
    setSelectedAnswers(newSelectedAnswers);
  
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(30);
      } else {
        handleQuizCompletion(newSelectedAnswers);
      }
    }, 1000);
  };

const calculateScore = (answers) => {
  console.log('Calculating score with answers:', answers);
  console.log('Questions array:', questions);
  
  let correctCount = 0;
  let totalQuestions = questions.length;

  for (let i = 0; i < totalQuestions; i++) {
    const userAnswer = answers[i];
    const correctOption = questions[i].correctOption;
    
    console.log(`Question ${i + 1}: ${questions[i].questionText}`);
    console.log('User answer:', userAnswer);
    console.log('Correct answer:', correctOption);
    
    if (userAnswer === correctOption) {
      correctCount++;
      console.log('✓ Correct');
    } else {
      console.log('✗ Incorrect');
    }
  }

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  console.log(`Final Score: ${correctCount}/${totalQuestions} = ${percentage}%`);
  return percentage;
};

const handleQuizCompletion = async (finalAnswers) => {
  if (showScore || isSubmitting) return;
  
  setIsSubmitting(true);
  setShowScore(true);
  
  console.log('Quiz completed with answers:', finalAnswers);
  const finalScore = calculateScore(finalAnswers);
  console.log('Final calculated score:', finalScore);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save your progress');
      setIsSubmitting(false);
      return;
    }

    const response = await fetch('http://localhost:3000/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        score: finalScore,
        quizTitle: 'Frontend Development',
        attemptDate: new Date().toISOString()
      })
    });

    const data = await response.json();
    
    if (data.status === 'ok') {
      localStorage.setItem('quizAttempts', JSON.stringify(data.quizAttempts));
      localStorage.setItem('profileStats', JSON.stringify(data.profileStats));
      localStorage.setItem('finalScore', finalScore);
      window.dispatchEvent(new Event('profileUpdated'));
      
      toast.success(`Quiz completed! Your score: ${finalScore}%`, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(139, 92, 246, 0.5)',
        },
      });

      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach(achievement => {
          toast.success(`🏆 New Achievement: ${achievement.title}!`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.5)',
            },
          });
        });
      }

      setTimeout(() => {
        navigate('/quiz');
      }, 2000);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <QuizTemplate
    title="Frontend Development Quiz"
    subtitle="Test your frontend development skills "
    questions={questions || []}
    currentQuestion={currentQuestion}
    timeLeft={timeLeft}
    showScore={showScore}
    calculateScore={(answers) => {
      console.log('Calculating score in template with:', answers);
      return calculateScore(answers);
    }}
    selectedAnswers={selectedAnswers}
    handleAnswerClick={handleAnswerClick}
  />
  );
}

export default FrontendQuiz;